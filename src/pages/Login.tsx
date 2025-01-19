import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useAuth } from '../contexts/AuthContext';
import styles from './Login.module.css';

interface LoginForm {
  email: string;
}

export default function Login() {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginForm>();
  const { signInWithMagicLink } = useAuth();
  const [magicLinkSent, setMagicLinkSent] = useState(false);

  const onSubmit = async (data: LoginForm) => {
    await signInWithMagicLink(data.email);
    setMagicLinkSent(true);
  };

  if (magicLinkSent) {
    return (
      <div className={styles.container}>
        <div className={styles.successContainer}>
          <h2 className={styles.successTitle}>Check your email</h2>
          <p className={styles.successMessage}>
            We've sent you a magic link to your email address. Click the link to sign in.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.formContainer}>
        <div className={styles.header}>
          <h2 className={styles.title}>
            Sign in to your account
          </h2>
          <p className={styles.subtitle}>
            We'll send you a magic link to your email
          </p>
        </div>
        <form className={styles.form} onSubmit={handleSubmit(onSubmit)}>
          <div>
            <label htmlFor="email" className={styles.inputLabel}>Email address</label>
            <input
              id="email"
              {...register('email', { 
                required: 'Email is required',
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: 'Invalid email address'
                }
              })}
              type="email"
              className={styles.input}
              placeholder="Email address"
            />
            {errors.email && (
              <p className={styles.error}>{errors.email.message}</p>
            )}
          </div>

          <div>
            <button
              type="submit"
              disabled={isSubmitting}
              className={styles.button}
            >
              {isSubmitting ? 'Sending magic link...' : 'Send magic link'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 