import React from 'react';

const Sidebar: React.FC = () => {
  return (
    <div style={{ width: '200px', background: '#f4f4f4', padding: '10px' }}>
      <h3>設定資料</h3>
      <ul>
        <li>キャラクター</li>
        <li>用語</li>
        <li>場所</li>
      </ul>
    </div>
  );
};

export default Sidebar; 