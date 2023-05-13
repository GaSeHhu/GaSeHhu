import React, { useEffect, useState } from 'react';
import { Avatar, Box, Button, Collapse, Container, CssBaseline, FormControl, FormControlLabel, Grid, InputLabel, Link, MenuItem, Select, Switch, Tab, Tabs, TextField, Typography } from "@mui/material";

import { Home as HomeIcon, PersonAdd as PersonAddIcon } from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import { TemporaryUser, useUserContext } from '../lib/User';
import { localize } from '../lib/i18n';
import { Room } from '../lib/Client';
import { PeerJsKnownServers, PreferredServerNamesPerCountryCode } from '../lib/consts';
import { useCountryCodeContext } from '../lib/CountryCodeContext';
import { getHashAvatarUrl } from '../lib/HashAvatar';
import { Footer } from './Footer';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

function HostTab() {
  const navigate = useNavigate();
  const [user, setUser] = useUserContext();
  const [nickname, setNickname] = useState<string>(user?.nickname || '');
  const setNicknameAndUsername = (name: string) => {
    setNickname(name);
    if (user) {
      user.nickname = name;
    }
  };
  const [hostServerName, setHostServerName] = useState<string>();

  const [showAdvancedOptions, setShowAdvancedOptions] = useState<boolean>(false);
  const toggleShowAdvancedOptions = () => setShowAdvancedOptions(prev => !prev);

  const countryCode = useCountryCodeContext();

  useEffect(() => {
    if (user === null) {
      setUser(new TemporaryUser());
    }
  }, [user, setUser]);

  useEffect(() => {
    if (countryCode && !hostServerName) {
      setHostServerName(prev => {
        if (!prev) {
          const preferredServerName = countryCode && PreferredServerNamesPerCountryCode[countryCode];
          return preferredServerName;
        }
        return undefined;
      });
    }
  }, [countryCode, hostServerName, setHostServerName]);

  if (!user) {
    return <></>;
  }

  const regenerateAvatar = () => {
    setUser(null);
  }

  const hostRoom = () => {
    navigate(hostServerName ? `/server/${hostServerName}/room/${user.userId}` : `/room/${user.userId}`);
  };

  return (
    <Box
      sx={{
        marginTop: 8,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}
    >
      <Avatar sx={{ m: 1, mb: 3, bgcolor: 'secondary.main' }}>
        <HomeIcon />
      </Avatar>
      <Typography component="h1" variant="h5" sx={{ mb: 4 }}>
        {localize('hostARoom')}
      </Typography>
      <Box sx={{ mt: 1, width: '320px' }}>
        <Avatar alt={user.nickname ?? user.userId} src={getHashAvatarUrl(user.userId)} sx={{ margin: '0 auto', width: 128, height: 128 }} />
        <Typography component="div" variant="caption" sx={{
          mt: 1,
          mb: 2,
          textAlign: 'center',
          color: 'grey',
        }}>
          {localize('poweredBy')} <Link variant="caption" color="secondary" underline="none" href="https://multiavatar.com" target="_blank" rel="noopener">Multiavatar</Link>
        </Typography>
        <Button fullWidth variant="text" sx={{ margin: '0 auto' }} onClick={regenerateAvatar}>{localize('regenerateAvatar')}</Button>
        <TextField
          margin="normal"
          required
          fullWidth
          autoFocus
          label={localize('yourNickname')}
          name="nickname"
          variant="standard"
          value={nickname}
          onChange={e => setNicknameAndUsername(e.target.value)}
        />
        <FormControlLabel
          control={<Switch checked={showAdvancedOptions} onChange={toggleShowAdvancedOptions} />}
          label={
            <Typography variant="body2">{localize('advancedOptions')}</Typography>
          }
        />
        <Collapse in={showAdvancedOptions} timeout="auto">
          <FormControl
            margin="normal"
            fullWidth
          >
            <InputLabel variant="standard" htmlFor="uncontrolled-native">{localize('server')}</InputLabel>
            <Select
              fullWidth
              value={hostServerName || ''}
              label={localize('server')}
              variant="standard"
              onChange={e => {setHostServerName(e.target.value)}}
            >
              {
                Object.keys(PeerJsKnownServers).map(serverName => (
                  <MenuItem key={serverName} value={serverName}>{serverName}</MenuItem>
                ))
              }
            </Select>
          </FormControl>
        </Collapse>
        <Button
          disabled={!Boolean(user.nickname)}
          type="submit"
          fullWidth
          variant="contained"
          color="secondary"
          sx={{ mt: 3, mb: 2 }}
          onClick={hostRoom}
        >
          {localize('host')}
        </Button>
      </Box>
    </Box>
  );
}

function GuestTab(props: {
  hostRoom?: Room;
}) {
  const navigate = useNavigate();
  const [user, setUser] = useUserContext();
  const [nickname, setNickname] = useState<string>('');
  
  const [hostRoomId, setHostRoomId] = useState<string | undefined>(props.hostRoom?.roomId);
  const [hostServerName, setHostServerName] = useState<string | undefined>(props.hostRoom?.serverName);

  const [showAdvancedOptions, setShowAdvancedOptions] = useState<boolean>(false);
  const toggleShowAdvancedOptions = () => setShowAdvancedOptions(prev => !prev);

  useEffect(() => {
    if (user === null) {
      setUser(new TemporaryUser());
    }
  }, [user, setUser]);

  if (!user) {
    return <></>;
  }

  const regenerateAvatar = () => {
    setUser(null);
  }

  const joinRoom = () => {
    user.nickname = nickname;
    navigate(hostServerName ? `/server/${hostServerName}/room/${hostRoomId}` : `/room/${hostRoomId}`);
  };

  return (
    <Box
      sx={{
        marginTop: 8,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}
    >
      <Avatar sx={{ m: 1, mb: 3, bgcolor: 'secondary.main' }}>
        <PersonAddIcon />
      </Avatar>
      <Typography component="h1" variant="h5" sx={{ mb: 4 }}>
        {localize('joinARoom')}
      </Typography>
      <Box sx={{ mt: 1, width: '320px' }}>
        <Avatar alt={user.nickname || user.userId} src={getHashAvatarUrl(user.userId)} sx={{ margin: '0 auto', width: 128, height: 128 }} />
        <Typography component="div" variant="caption" sx={{
          mt: 1,
          mb: 2,
          textAlign: 'center',
          color: 'grey',
        }}>
          {localize('poweredBy')} <Link variant="caption" color="secondary" underline="none" href="https://multiavatar.com" target="_blank" rel="noopener">Multiavatar</Link>
        </Typography>
        <Button fullWidth variant="text" sx={{ margin: '0 auto' }} onClick={regenerateAvatar}>{localize('regenerateAvatar')}</Button>
        <TextField
          margin="normal"
          required
          fullWidth
          autoFocus
          label={localize('yourNickname')}
          name="nickname"
          variant="standard"
          value={nickname}
          onChange={e => setNickname(e.target.value)}
        />
        <TextField
          margin="normal"
          required
          fullWidth
          label={localize('roomId')}
          name="roomid"
          variant="standard"
          value={hostRoomId}
          onChange={e => setHostRoomId(e.target.value)}
        />
        <FormControlLabel
          control={<Switch checked={showAdvancedOptions} onChange={toggleShowAdvancedOptions} />}
          label={
            <Typography variant="body2">{localize('advancedOptions')}</Typography>
          }
        />
        <Collapse in={showAdvancedOptions} timeout="auto">
          <FormControl
            margin="normal"
            fullWidth
          >
            <InputLabel variant="standard" htmlFor="uncontrolled-native">{localize('server')}</InputLabel>
            <Select
              fullWidth
              value={hostServerName || ''}
              label={localize('server')}
              variant="standard"
              onChange={e => {setHostServerName(e.target.value)}}
            >
              {
                Object.keys(PeerJsKnownServers).map(serverName => (
                  <MenuItem key={serverName} value={serverName}>{serverName}</MenuItem>
                ))
              }
            </Select>
          </FormControl>
        </Collapse>
        <Button
          disabled={!Boolean(nickname && hostRoomId)}
          type="submit"
          fullWidth
          variant="contained"
          color="secondary"
          sx={{ mt: 3, mb: 2 }}
          onClick={joinRoom}
        >
          {localize('join')}
        </Button>
      </Box>
    </Box>
  );
}

export enum HomePageTab {
  HOST = 0,
  JOIN = 1,
};

function HomePage(props: {
  tab?: HomePageTab;
}) {
  const {roomId, serverName} = useParams();
  const hostRoom = roomId ? {roomId, serverName} : undefined;
  const [value, setValue] = useState(props.tab ?? 0);
  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };
  return (
    <>
      <Grid container component="main" sx={{ height: '100vh' }}>
        <CssBaseline />
        <Box sx={{ width: '100%' }}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs value={value} onChange={(handleChange)} centered textColor="secondary">
              <Tab label={localize('host')} color="secondary" />
              <Tab label={localize('join')} color="secondary" />
            </Tabs>
          </Box>
          <TabPanel value={value} index={HomePageTab.HOST}>
            <HostTab/>
          </TabPanel>
          <TabPanel value={value} index={HomePageTab.JOIN}>
            <GuestTab hostRoom={hostRoom}/>
          </TabPanel>
          <Footer/>
        </Box>
      </Grid>
    </>
  );
}

export default HomePage;
