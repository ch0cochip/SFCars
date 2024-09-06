import { Button, Modal } from "flowbite-react";
import PropTypes from "prop-types";

const ConfirmModal = ({ showConfirmModal, setShowConfirmModal }) => {
  const closeModal = () => {
    setShowConfirmModal(false);
  }

  return (
    <div>
      <Modal
        show={showConfirmModal}
        onClose={closeModal}>
        <Modal.Header className="bg-custom-orange text-white">Withdraw Confirmed!</Modal.Header>
        <Modal.Body>
          <div>
            Withdraw details completed! Please wait for 3-5 working days to process.
          </div>
        </Modal.Body>
        <Modal.Footer>
        <div className="flex flex-row justify-end space-x-4">
            <Button
              className="bg-custom-orange hover:bg-custom-orange-dark text-white"
              onClick={closeModal}
            >
              Close
            </Button>
          </div>
        </Modal.Footer>
      </Modal>

    </div>
  );
};

export default ConfirmModal

ConfirmModal.propTypes = {
  showConfirmModal: PropTypes.bool.isRequired,
  setShowConfirmModal: PropTypes.func.isRequired,
};