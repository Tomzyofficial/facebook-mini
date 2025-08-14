import styles from "@/app/styles/styles.module.css";
const Modal = ({ isOpen, onClose, children, ...prop }) => {
  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={onClose} {...prop}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        {children}
      </div>
    </div>
  );
};
export default Modal;
