from typing import Optional
from bson import ObjectId
from ..db import db
from ..db import inbox, user as user_db, listings, bookings
from .. import helpers
from datetime import datetime as dt

''' cx_pay
    Function takes in booking_id, the user_id of the customer making the payment
    and whether they are using their wallet to pay for.
'''
def cx_pay(bill_id: ObjectId, payee_id: ObjectId, use_wallet: bool) -> Optional['dict']:
    bill_id = ObjectId(bill_id)
    payee_id = ObjectId(payee_id)

    database = db.get_database()
    bill = get_bill(bill_id)
    booking = bookings.get(bill['booking_id'])
    listing = listings.get(booking['listing_id'])
    payee = user_db.get_user(payee_id)

    # edge case: if bank acc was not initialised in database yet
    bank_db = database['BankAccount']
    if not bank_db.find_one():
        bank_db.insert_one({
            'name': 'sfcars',
            'balance': 0
        })

    # check that wallet has sufficient balance
    if use_wallet and payee['wallet'] < booking['price']:
        return False

    # user chooses to deduct from wallet - check and deduct amt from wallet
    # otherwise direct debited, mock payment, so skip.
    if payee['wallet'] >= booking['price'] and use_wallet:
        database['UserAccount'].update_one(
            { '_id': payee_id },
            { "$inc": { "wallet": -booking['price'] }}
        )
        document = {
            'bill': bill_id,
            'booking': booking['_id'],
            'amount': -booking['price'],
            'balance': database['UserAccount'].find_one( {'_id': payee_id })['wallet']
        }
        # add transaction to payee's history
        add_transaction(payee_id, document)

    else:
        # add to payee's history - did not use wallet
        document = {
            'bill': bill_id,
            'booking': booking['_id'],
            'amount': -booking['price'],
            'balance': database['UserAccount'].find_one( {'_id': payee_id })['wallet']
        }
        add_transaction(payee_id, document)

    # take 15% service fee
    service_fee = booking['price'] * 0.15
    bank_db.find_one_and_update(
        {'name': 'sfcars'},
        {'$inc': {'balance': service_fee}}
    )

    # update provider's total revenue and wallet made from listings
    received_amt = booking['price'] - service_fee
    db.get_database()['UserAccount'].update_one(
        { '_id': listing['provider'] },
        { '$inc': {
            'revenue': received_amt,
            'wallet': received_amt
        }}
    )

    # add transaction to the provider's history
    add_transaction(listing['provider'], {
        'listing': listing['_id'],
        'amount': received_amt,
        'balance': database['UserAccount'].find_one( {'_id': listing['provider'] } )['wallet']
    })

    # booking is not recurring, can freely update booking to be 'paid'
    database['Bookings'].update_one(
        {'_id': booking['_id']},
        {'$set': {'paid': True}}
    )

    # update bill to be paid too
    database['Bills'].update_one(
        {'_id': bill_id},
        {'$set': {'paid': True}}
    )

    # payee receives receipt in inbox
    receipt = helpers.payment_receipt({
        'recipient_id': payee_id,
        'email': payee['email'],
        'payment_id': bill_id,
        'first_name': payee['first_name'],
        'payment_date': dt.now(),
        'price': -booking['price'],
        'payment_status': True
    })
    inbox.create(receipt)

    # provider receives notification of payment from booking
    provider = user_db.get_user(listing['provider'])
    receipt = helpers.payment_received({
        'recipient_id': provider['_id'],
        'email': provider['email'],
        'payment_id': ObjectId(),
        'first_name': provider['first_name'],
        'payment_date': dt.now(),
        'price': received_amt,
        'payment_status': 'Transferred'
    })

    return { 'amount_received': booking['price'] - service_fee }

''' cx_withdraw
    Allows customer to withdraw money from their wallet
'''
def cx_withdraw(user_id: ObjectId, amt: float) -> bool:
    user_id = ObjectId(user_id)
    database = db.get_database()
    user = user_db.get_user(user_id)

    if user['wallet'] < amt:
        # user cannot withdraw this amount from their wallet, shouldn't make it
        # past frontend, but double checking.
        return False

    # deduct amount from wallet to simulate withdrawal
    database['UserAccount'].update_one(
        { '_id': user_id },
        { '$inc': { 'wallet': -amt } }
    )

    add_transaction(user_id, {
        'amount': -amt,
        'balance': database['UserAccount'].find_one( {'_id': user_id } )['wallet']
    })

    receipt = helpers.payment_receipt({
        'recipient_id': user['_id'],
        'email': user['email'],
        'payment_id': ObjectId(),
        'first_name': user['first_name'],
        'payment_date': dt.now(),
        'price': -amt,
        'payment_status': True
    })
    inbox.create(receipt)

    # confirmation that money has been withdrawed
    return True

''' cx_topup
    Allows customer to topup their wallet with own money
'''
def cx_topup(user_id: ObjectId, amt: float) -> None:
    user_id = ObjectId(user_id)
    database = db.get_database()
    user = user_db.get_user(user_id)

    database['UserAccount'].update_one(
        { '_id': user_id },
        { '$inc': { 'wallet': amt } }
    )


    add_transaction(user_id, {
        'amount': amt,
        'balance': database['UserAccount'].find_one( {'_id': user_id } )['wallet']
    })

    # put payment receipt into user inbox
    receipt = helpers.payment_receipt({
        'recipient_id': user['_id'],
        'email': user['email'],
        'payment_id': ObjectId(),
        'first_name': user['first_name'],
        'payment_date': dt.now(),
        'price': amt,
        'payment_status': True
    })
    inbox.create(receipt)

''' add_transaction
    Adds transaction (withdrawal, payment, topup) to user's recent transactions
'''
def add_transaction(user_id: ObjectId, data: dict) -> None:
    user_id = ObjectId(user_id)
    database = db.get_database()

    document = {
        '_id': ObjectId(),
        'listing': data['listing'] if 'listing' in data else None,
        'booking': data['booking'] if 'booking' in data else None,
        'amount': data['amount'],
        'balance': data['balance'],
        'timestamp': dt.now().isoformat()
    }

    database['UserAccount'].update_one(
        { '_id': user_id },
        { '$push': { 'recent_transactions': document }}
    )

''' cx_bill
    Creates bill for customer to pay for
'''
def cx_bill(user_id: ObjectId) -> Optional['dict']:
    user_id = ObjectId(user_id)
    database = db.get_database()

    # find all bookings under this user_id and is not paid
    bookings = database['Bookings'].find(
        {
            'consumer': user_id,
            'paid': False,
            'recurring': ''
        }
    )

    for booking in bookings:
        # if there is an existing bill in the system for this booking, then do
        # not create a duplicate bill
        if database['Bills'].find_one({
            'booking_id': booking['_id'],
            'start_time': booking['start_time'],
            'end_time': booking['end_time'],
            'paid': False
        }):
            continue

        bill = {
            '_id': ObjectId(),
            'user_id': user_id,
            'booking_id': booking['_id'],
            'start_time': booking['start_time'],
            'end_time': booking['end_time'],
            'price': booking['price'],
            'paid': False
        }

        database['Bills'].insert_one(bill)
        database['Bookings'].update_one(
            { '_id': booking['_id'] },
            { '$push': { 'bills': bill['_id'] } }
        )

def get_bill(bill_id):
    bill_id = ObjectId(bill_id)
    return db.get_database()['Bills'].find_one({'_id': bill_id})
