import styles from "@/app/styles/styles.module.css";
const Modal = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        {/*   <div className={styles.modalTop}>
          <button onClick={onClose} className={styles.closeButton}>
            X
          </button>
          <p>Create post</p>
          <button type="submit" onClick={onSubmit}>
            Post
          </button>
        </div> */}
        {children}
      </div>
    </div>
  );
};
export default Modal;
