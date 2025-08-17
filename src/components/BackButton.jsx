import { ChevronIcon } from '~/icons/ChevronIcon'
import './BackButton.css'

const handleClick = () => {
  window.navigator.back()
}

export const BackButton = () => {
  return (
    <button type="button" onClick={handleClick} className="back_button">
      <ChevronIcon className="back_button__icon" />
      Back
    </button>
  )
}
