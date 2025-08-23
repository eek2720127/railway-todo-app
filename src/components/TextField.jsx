import './TextField.css'

export const TextField = ({
  label,
  value,
  onChange,
  placeholder,
  type = 'text',
}) => {
  return (
    <div className="text_field">
      {label && <label className="text_field__label">{label}</label>}
      <input
        type={type}
        className="text_field__input"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
      />
    </div>
  )
}

export default TextField
