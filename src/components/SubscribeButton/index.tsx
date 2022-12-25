import { signIn, useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { api } from '../../services/api';
import { getStripeJs } from '../../services/stripe-js';
import styles from './styles.module.scss'

export function SubscribeButton() {
  const { data: sessionData } = useSession()
  const router = useRouter()

  async function handleSubscribe() {
    if (!sessionData) {
      signIn('github')
      return
    }

    if (sessionData?.activeSubscription) {
      router.push('/posts')
      return
    }

    try {
      const response = await api.post('/subscribe')

      const { sessionId } = response.data

      const stripe = await getStripeJs()
      await stripe.redirectToCheckout({ sessionId })

    } catch (e) {
      alert(e.message)
    }
  }

  return (
    <button
      type="button"
      className={styles.subscribeButton}
      onClick={handleSubscribe}
    >
      Subscribe now
    </button>
  )
}