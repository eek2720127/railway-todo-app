// src/components/TaskCreateForm.jsx
import React, { useCallback, useEffect, useState, useRef } from 'react'
import { useDispatch } from 'react-redux'
import './TaskCreateForm.css'
import { CheckIcon } from '~/icons/CheckIcon'
import { createTask } from '~/store/task'

// 共通コンポーネント（作っていればこちらを使う）
import Button from '~/components/ui/Button'
import TextField from '~/components/ui/TextField'

export const TaskCreateForm = () => {
  const dispatch = useDispatch()

  const refForm = useRef(null)
  const textareaRef = useRef(null)

  const [formState, setFormState] = useState('initial')
  const [title, setTitle] = useState('')
  const [detail, setDetail] = useState('')
  const [done, setDone] = useState(false)

  const handleToggle = useCallback(() => setDone((p) => !p), [])
  const handleFocus = useCallback(() => setFormState('focused'), [])
  const handleDiscard = useCallback(() => {
    setTitle('')
    setDetail('')
    setFormState('initial')
    setDone(false)
  }, [])

  const handleBlur = useCallback(() => {
    if (title || detail) return

    setTimeout(() => {
      const formElement = refForm.current
      if (formElement && formElement.contains(document.activeElement)) return

      setFormState('initial')
      setDone(false)
    }, 100)
  }, [title, detail])

  const onSubmit = useCallback(
    (event) => {
      event.preventDefault()
      setFormState('submitting')

      void dispatch(createTask({ title, detail, done }))
        .unwrap()
        .then(() => {
          handleDiscard()
        })
        .catch((err) => {
          alert(err.message || '送信に失敗しました')
          setFormState('focused')
        })
    },
    [title, detail, done, dispatch, handleDiscard]
  )

  // textarea の自動リサイズ
  useEffect(() => {
    const el = textareaRef.current
    if (!el) return

    const recalc = () => {
      el.style.height = 'auto'
      el.style.height = `${el.scrollHeight}px`
    }

    el.addEventListener('input', recalc)
    recalc()
    return () => el.removeEventListener('input', recalc)
  }, [textareaRef, detail])

  return (
    <form
      ref={refForm}
      className="task_create_form"
      onSubmit={onSubmit}
      data-state={formState}
    >
      <div className="task_create_form__title_container">
        <button
          type="button"
          onClick={handleToggle}
          className="task_create_form__mark_button"
          onFocus={handleFocus}
          onBlur={handleBlur}
          aria-pressed={done}
          aria-label={done ? 'Completed' : 'Incomplete'}
        >
          {done ? (
            <div className="task_create_form__mark____complete">
              <CheckIcon className="task_create_form__mark____complete_check" />
            </div>
          ) : (
            <div className="task_create_form__mark____incomplete" />
          )}
        </button>

        {/* タイトル入力：共通 TextField を使用（ラベル不要なら label を渡さない） */}
        <TextField
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Add a new task..."
          type="text"
          // この TextField は内部で input を出すので onFocus/onBlur を渡す
          onFocus={handleFocus}
          onBlur={handleBlur}
          required={false}
          className="task_create_form__title"
        />
      </div>

      {formState !== 'initial' && (
        <div>
          {/* 詳細（textarea）: TextField の multiline を使うか直接 textarea を使う */}
          <TextField
            value={detail}
            onChange={(e) => setDetail(e.target.value)}
            placeholder="Add a description here..."
            multiline
            rows={1}
            required={false}
            // textarea の auto-resize のため ref を渡す（TextField が ref を forward していない場合は直接 textarea を使ってください）
            // ここでは直接 textarea を使った実装にフォールバックします：
            className="task_create_form__detail_wrapper"
          />

          {/* もし上の TextField が ref を受け取れるなら textareaRef を渡し、そうでなければ下の native textarea に差し替えてください */}
          {/* Native textarea（auto-resize 用 ref を直接セット） */}
          <textarea
            ref={textareaRef}
            rows={1}
            className="task_create_form__detail"
            placeholder="Add a description here..."
            value={detail}
            onChange={(e) => setDetail(e.target.value)}
            onBlur={handleBlur}
            disabled={formState === 'submitting'}
          />

          <div className="task_create_form__actions">
            <Button
              type="button"
              variant="secondary"
              onClick={handleDiscard}
              onBlur={handleBlur}
              disabled={(!title && !detail) || formState === 'submitting'}
            >
              Discard
            </Button>

            <div className="task_create_form__spacer" />

            <Button
              type="submit"
              variant="primary"
              disabled={!title || !detail || formState === 'submitting'}
            >
              Add
            </Button>
          </div>
        </div>
      )}
    </form>
  )
}

export default TaskCreateForm
