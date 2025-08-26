// BackButton.jsx
import './BackButton.css'

// 戻るアイコンを直接ここで定義
const ChevronIcon = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth="2"
    {...props}
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 18l-6-6 6-6" />
  </svg>
)

const handleClick = () => {
  window.history.back() // ← 修正済み
}

export const BackButton = () => {
  return (
    <button type="button" onClick={handleClick} className="back_button">
      <ChevronIcon className="back_button__icon" />
      Back
    </button>
  )
}
