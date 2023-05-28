import React from 'react';

import { List } from '@mui/material';
import { User } from '../../lib/User';
import { Footer } from '../Footer';
import MemberListItem from './MemberListItem';
import RoomLinkItem from './RoomLinkItem';

export default function Sidebar(props: {
  members: Array<User>;
  onLeave?: () => void;
}) {
  return (
    <>
      <List component="div" sx={{
        width: '100%',
        maxWidth: 360,
        bgcolor: 'background.paper',
      }}>
        <RoomLinkItem onLeave={props.onLeave}/>
        <MemberListItem members={props.members}/>
        <Footer/>
      </List>
    </>
  )
}
