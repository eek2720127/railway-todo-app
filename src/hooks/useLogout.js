// src/hooks/useLogout.js
import { useDispatch } from 'react-redux'
import { useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { logout } from '~/store/auth'

export const useLogout = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate() // useNavigate は navigate() 関数を返す

  const handleLogout = useCallback(async () => {
    try {
      // logout が createAsyncThunk なら unwrap() が使えます
      await dispatch(logout()).unwrap()
    } catch (err) {
      // 必要ならエラー処理（トースト等）
      console.error('logout failed', err)
    }
    // 成功／失敗にかかわらずサインイン画面へ遷移するならここで navigate
    navigate('/signin')
  }, [dispatch, navigate]) // 依存配列にはフックの返り値(dispatch, navigate)を入れる

  return {
    logout: handleLogout,
  }
}

export default useLogout
