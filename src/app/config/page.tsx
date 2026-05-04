import { notFound } from 'next/navigation'
import SetupClient from './SetupClient'

export default function ConfigPage() {
  if (process.env.NODE_ENV === 'production') {
    notFound()
  }

  return <SetupClient />
}
