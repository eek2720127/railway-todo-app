import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchLists } from '~/store/list/index';

const Home = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate(); // useNavigate の戻り値を navigate にする

  const currentListId = useSelector((state) => state.list.current);

  useEffect(() => {
    // dispatch を依存配列に入れる（hooks ルール）
    void dispatch(fetchLists());
  }, [dispatch]);

  useEffect(() => {
    if (currentListId) {
      // history.push の代わりに navigate を使う
      navigate(`/lists/${currentListId}`);
      // 必要なら replace を付けて履歴を残さない: navigate(`/lists/${id}`, { replace: true });
    }
  }, [currentListId, navigate]); // navigate を依存に含める

  return <div />;
};

export default Home;
