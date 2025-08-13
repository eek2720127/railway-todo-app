import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { signup } from '~/store/auth';
import TextField from '~/components/ui/TextField';
import Button from '~/components/ui/Button';
import './index.css';

export default function SignUp() {
  // ... state, handleSubmit as before ...

  return (
    <div className="signup-page">
      <header className="page-header">...</header>

      <main className="signup-container">
        <div className="signup-left" />
        <div className="signup-right">
          <div className="signup-card">
            <h2 className="page-title">新規作成</h2>

            <form className="signup-form" onSubmit={handleSubmit}>
              <TextField
                label="メールアドレス"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="example@example.com"
                required
              />

              <TextField
                label="ユーザ名"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="表示名"
                required
              />

              <TextField
                label="パスワード"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="パスワードを入力"
                required
              />

              <Button
                type="submit"
                variant="primary"
                size="md"
                disabled={loading}
              >
                {loading ? '登録中...' : '作成'}
              </Button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
