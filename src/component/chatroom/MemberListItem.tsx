import React from 'react';

import { AvatarGroup } from '@mui/material';
import { localize } from '../../lib/i18n';
import { User } from '../../lib/User';
import CollapsibleListItem from '../CollapsibleListItem';
import { UserAvatar } from '../UserAvatar';

export default function MemberListItem(props: {
  members: Array<User>;
}) {
  return (
    <CollapsibleListItem
      headerTextProps={{
        primary: localize('members'),
        primaryTypographyProps: {
          variant: "h6"
        },
      }}
    >
      <AvatarGroup max={7} sx={{ justifyContent: 'center' }}>
        {
          props.members.map((member, i) =>
            <UserAvatar key={i} user={member} online tooltip/>
          )
        }
      </AvatarGroup>
    </CollapsibleListItem>
  );
}
