export const TaskItem = ({ task }) => {
  const deadline = new Date(task.limit)
  const now = new Date()

  const diffMs = deadline - now
  const diffMinutes = Math.floor(diffMs / 1000 / 60)
  const diffHours = Math.floor(diffMinutes / 60)
  const diffDays = Math.floor(diffHours / 24)

  let remaining = ''
  if (diffMs <= 0) {
    remaining = '期限切れ'
  } else if (diffDays > 0) {
    remaining = `${diffDays}日 ${diffHours % 24}時間`
  } else if (diffHours > 0) {
    remaining = `${diffHours}時間 ${diffMinutes % 60}分`
  } else {
    remaining = `${diffMinutes}分`
  }

  return (
    <div className="task_item">
      <h3>{task.title}</h3>
      <p>{task.description}</p>
      <p>期限: {deadline.toLocaleString()}</p>
      <p>残り: {remaining}</p>
    </div>
  )
}
