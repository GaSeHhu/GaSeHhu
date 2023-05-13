import React, { useEffect, useState } from 'react';
import {
  HashRouter as Router,
  Route,
  Routes,
  useNavigate,
  useParams,
} from 'react-router-dom';
import './App.css';
import ChatRoom from './component/ChatRoom';
import HomePage, { HomePageTab } from './component/HomePage';
import { CountryCodeContext, fetchCountryCode } from './lib/CountryCodeContext';
import { User, UserContext, useUserContext } from './lib/User';

function NavigateToHomePage() {
  const navigate = useNavigate();
  useEffect(() => {
    navigate('/');
  });
  return <></>;
}

function ChatRoomWithId() {
  const {roomId, serverName} = useParams();
  const [user,] = useUserContext();
  if (!roomId) {
    return <NavigateToHomePage/>;
  }
  if (!user || !user.nickname) {
    return <HomePage tab={HomePageTab.JOIN}/>;
  }
  return <ChatRoom room={{roomId, serverName}} user={user}/>
}

function App() {
  const [countryCode, setCountryCode] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  useEffect(() => {
    if (!countryCode) {
      fetchCountryCode().catch(() => null).then(setCountryCode);
    }
  }, [countryCode]);
  return (
    <CountryCodeContext.Provider value={countryCode}>
      <UserContext.Provider value={[user, setUser]}>
        <Router>
          <Routes>
            <Route path="/" element={<HomePage/>}/>
            <Route path="/server/:serverName/room/:roomId" element={<ChatRoomWithId/>}/>
            <Route path="/room/:roomId" element={<ChatRoomWithId/>}/>
          </Routes>
        </Router>
      </UserContext.Provider>
    </CountryCodeContext.Provider>
  );
}

export default App;
