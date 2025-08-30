// src/pages/list/new/index.page.jsx
import React, { useCallback, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { BackButton } from '~/components/BackButton'
import './index.css'
import { createList, setCurrentList } from '~/store/list/index'
import { useId } from '~/hooks/useId'

const NewList = () => {
  const id = useId()
  const navigate = useNavigate()
  const dispatch = useDispatch()

  const [title, setTitle] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const onSubmit = useCallback(
    async (event) => {
      event.preventDefault()
      setErrorMessage('')
      if (!title.trim()) {
        setErrorMessage('タイトルは必須です')
        return
      }

      setIsSubmitting(true)
      try {
        // createList は thunk で id を返す想定
        const listId = await dispatch(
          createList({ title: title.trim() })
        ).unwrap()
        dispatch(setCurrentList(listId))
        // 作成後はトップへ戻す（必要なら `/lists/${listId}` に移動）
        navigate(`/`)
      } catch (err) {
        // API のエラーメッセージを表示
        setErrorMessage(err?.message || '作成に失敗しました')
      } finally {
        setIsSubmitting(false)
      }
    },
    [title, dispatch, navigate]
  )

  const handleCancel = useCallback(() => {
    // 前のページに戻る。新規作成はモーダル化している場合は onCancel を呼ぶ設計にする
    navigate(-1)
  }, [navigate])

  return (
    <main className="new_list">
      <BackButton />
      <h2 className="new_list__title">リスト作成</h2>

      {errorMessage && (
        <p className="new_list__error" role="alert">
          {errorMessage}
        </p>
      )}

      <form className="new_list__form" onSubmit={onSubmit}>
        <fieldset className="new_list__form_field">
          <label htmlFor={`${id}-title`} className="new_list__form_label">
            Name
          </label>
          <input
            id={`${id}-title`}
            className="app_input"
            placeholder="Family"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            aria-label="リスト名"
          />
        </fieldset>

        <div className="new_list__form_actions">
          {/* キャンセル（左） */}
          <button
            type="button"
            className="app_button"
            onClick={handleCancel}
            aria-label="キャンセルして戻る"
            disabled={isSubmitting}
          >
            キャンセル
          </button>

          <div className="new_list__form_actions_spacer" />

          {/* 作成（右） */}
          <button
            type="submit"
            className="app_button"
            disabled={isSubmitting}
            aria-disabled={isSubmitting}
          >
            {isSubmitting ? '作成中...' : '作成'}
          </button>
        </div>
      </form>
    </main>
  )
}

export default NewList
