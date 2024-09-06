"use client";

import { Button, Modal, Label } from "flowbite-react";
import { useState, useRef, useEffect } from "react";
import { useUser } from "@contexts/UserProvider";
import PaymentDetailsModal from "@components/PaymentDetailsModal";
import PropTypes from "prop-types";
import Select from "react-select";
import { makeRequest } from "@utils/utils";

const WithdrawModal = ({
  showWithdrawModal,
  setShowWithdrawModal,
  setConfirmModalHandler,
  payment_details,
  amount,
}) => {
  const [showPaymentDetailsModal, setShowPaymentDetailsModal] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState(amount);
  const [withdrawAmountError, setWithdrawAmountError] = useState("");
  const { user } = useUser();

  const paymentMethodOptions = user.payment_details.map((payment) => ({
    value: payment.card_number,
    label: `**** **** **** ${payment.card_number.slice(-4)}`,
  }));

  useEffect(() => {
    setWithdrawAmount(amount);
  }, [payment_details, amount, showWithdrawModal]);

  const ref = useRef(null);

  useEffect(() => {
    ref.current = document.body;
  }, []);

  const validateConfirm = async () => {
    const isAmountExist = !!withdrawAmount;
    setWithdrawAmountError(isAmountExist ? "" : "This field is required");

    if (isAmountExist) {
      const body = {
        amt: parseFloat(withdrawAmount),
      };
      const response = await makeRequest("/withdraw", "POST", body);
      if (response.error) {
        throw new Error(response.error);
      } else {
        closeWithdrawModal();
        setConfirmModalHandler();
      }
    }
  };

  const closeWithdrawModal = () => {
    setWithdrawAmountError("");
    setWithdrawAmount("");
    setShowWithdrawModal(false);
  };

  return (
    <div>
      <Button
        className="bg-custom-orange hover:bg-custom-orange-dark text-white"
        onClick={() => setShowWithdrawModal(true)}
      >
        Withdraw
      </Button>

      <Modal
        show={showWithdrawModal}
        onClose={closeWithdrawModal}
        root={ref.current}
      >
        <Modal.Header className="bg-custom-orange text-white">
          Withdraw Details
        </Modal.Header>

        <Modal.Body>
          <div>
            <div className="flex flex-col">
              <Label htmlFor="small" value="Payment Method" />
              <div>
                {user.payment_details.length !== 0 ? (
                  <Select
                    defaultValue={paymentMethodOptions[0]}
                    options={paymentMethodOptions}
                  />
                ) : (
                  <PaymentDetailsModal
                    showPaymentDetailsModal={showPaymentDetailsModal}
                    setShowPaymentDetailsModal={setShowPaymentDetailsModal}
                  />
                )}
              </div>
            </div>
          </div>

          <div>
            <div className="mb-2 block">
              <Label htmlFor="small" value="Withdraw Amount" />
            </div>
            <div className="relative">
              <input
                className="w-full border-2 border-gray-300 rounded-3xl p-2 mt-2 mb-4"
                type="text"
                placeholder="$xx"
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(e.target.value)}
              />
            </div>
            <p className="error_text">{withdrawAmountError}</p>
          </div>
        </Modal.Body>

        <Modal.Footer>
          <div className="flex flex-row justify-end space-x-4">
            <Button
              className="bg-custom-orange hover:bg-custom-orange-dark text-white"
              onClick={closeWithdrawModal}
            >
              Cancel
            </Button>
            <Button
              className="bg-custom-orange hover:bg-custom-orange-dark text-white"
              onClick={validateConfirm}
            >
              Confirm
            </Button>
          </div>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default WithdrawModal;

WithdrawModal.propTypes = {
  showWithdrawModal: PropTypes.bool.isRequired,
  setShowWithdrawModal: PropTypes.func.isRequired,
  setConfirmModalHandler: PropTypes.func.isRequired,
  payment_details: PropTypes.string.isRequired,
  amount: PropTypes.number.isRequired,
};
