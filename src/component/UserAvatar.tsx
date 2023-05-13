import React from 'react';

import { User } from '../lib/User';

import { Avatar, Badge, styled, Tooltip } from '@mui/material';
import { getHashAvatarUrl } from '../lib/HashAvatar';

const OnlineBadge = styled(Badge)(({ theme }) => ({
  '& .MuiBadge-badge': {
    backgroundColor: '#44b700',
    color: '#44b700',
    boxShadow: `0 0 0 2px ${theme.palette.background.paper}`,
  },
}));

export function UserAvatar(props: {
  user: User;
  online?: boolean;
  tooltip?: boolean;
}) {
  let component = <Avatar alt={props.user.nickname ?? props.user.userId} src={getHashAvatarUrl(props.user.userId)} />;
  if (props.online) {
    component = (
      <OnlineBadge
        overlap="circular"
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        variant="dot"
      >
        {component}
      </OnlineBadge>
    );
  }
  if (props.tooltip) {
    component = (
      <Tooltip title={props.user.nickname}>
        {component}
      </Tooltip>
    );
  }
  return component;
}
