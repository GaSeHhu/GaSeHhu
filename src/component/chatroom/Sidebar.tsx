import React from 'react';

import { List } from '@mui/material';
import { Participant } from '../../lib/Client';
import { User } from '../../lib/User';
import { Footer } from '../Footer';
import MemberListItem from './MemberListItem';
import RoomLinkItem from './RoomLinkItem';

export default function Sidebar(props: {
  participant: Participant;
  members: Array<User>;
}) {
  return (
    <>
      <List component="div" sx={{
        width: '100%',
        maxWidth: 360,
        bgcolor: 'background.paper',
      }}>
        <RoomLinkItem/>
        <MemberListItem members={props.members}/>
        <Footer/>
      </List>
    </>
  )
}
