// src/pages/signin/index.page.jsx
import React, { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Navigate, useNavigate } from 'react-router-dom'
import { login } from '~/store/auth'
import './index.css'

export default function SignIn() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const isLoggedIn = useSelector((state) => state.auth.token !== null)

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errorMsg, setErrorMsg] = useState(null)
  const [loading, setLoading] = useState(false)

  if (isLoggedIn) return <Navigate to="/" replace />

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErrorMsg(null)
    setLoading(true)
    try {
      await dispatch(login({ email, password })).unwrap()
      navigate('/', { replace: true })
    } catch (err) {
      const msg = err?.message ?? 'ログインに失敗しました'
      setErrorMsg(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="signin-layout">
      <div className="signin">
        <h2 className="signin__title">サインイン</h2>

        {errorMsg && <div className="signin__error">{errorMsg}</div>}

        <form className="signin__form" onSubmit={handleSubmit}>
          <div className="signin__form_field">
            <label className="signin__form_label">メールアドレス</label>
            <input
              className="signin__input"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder=""
              required
            />
          </div>

          <div className="signin__form_field">
            <label className="signin__form_label">パスワード</label>
            <input
              className="signin__input"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder=""
              required
            />
          </div>

          <div className="signin__form_actions">
            <div className="signin__form_actions_spacer" />
            <button className="signin__button" type="submit" disabled={loading}>
              {loading ? 'Signing in...' : 'サインイン'}
            </button>
          </div>
        </form>

        <p className="signin__footer">
          <a href="/signup">新規作成</a>
        </p>
      </div>
    </div>
  )
}
