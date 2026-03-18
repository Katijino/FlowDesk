import { useNavigate } from 'react-router-dom'
import { SetupWizard } from '../../components/setup/SetupWizard'

export default function SetupPage() {
  const navigate = useNavigate()

  return (
    <SetupWizard
      onComplete={() => navigate('/dashboard/jobs')}
      onExit={() => navigate('/dashboard/jobs')}
    />
  )
}
