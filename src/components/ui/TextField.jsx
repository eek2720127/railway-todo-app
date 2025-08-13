// src/components/ui/TextField.jsx
import React, { forwardRef } from 'react';
import './TextField.css';

/**
 * Props:
 * - id, label, value, onChange, placeholder
 * - type: 'text' | 'email' | 'password' etc.
 * - multiline: boolean (true -> textarea)
 * - rows: number (textarea の初期行数)
 * - required: boolean
 * - error: string (エラーメッセージを表示)
 * - className: 追加クラス
 * - その他 ...rest は input/textarea に渡ります
 */
const TextField = forwardRef(
  (
    {
      id,
      label,
      value,
      onChange,
      placeholder = '',
      type = 'text',
      multiline = false,
      rows = 3,
      required = false,
      className = '',
      error = '',
      ...rest
    },
    ref
  ) => {
    const inputId = id || `tf-${Math.random().toString(36).slice(2, 9)}`;

    return (
      <div className={`tf ${className}`}>
        {label && (
          <label className="tf__label" htmlFor={inputId}>
            {label}
          </label>
        )}

        {multiline ? (
          <textarea
            id={inputId}
            ref={ref}
            className="tf__control"
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            rows={rows}
            required={required}
            {...rest}
          />
        ) : (
          <input
            id={inputId}
            ref={ref}
            className="tf__control"
            type={type}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            required={required}
            {...rest}
          />
        )}

        {error && <div className="tf__error">{error}</div>}
      </div>
    );
  }
);

export default TextField;
