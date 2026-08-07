import styles from './ErrorMessage.module.css';

interface Props {
  message: string;
}

export function ErrorMessage({ message }: Props) {
  if (!message) return null;
  return <p className={styles.error}>{message}</p>;
}
