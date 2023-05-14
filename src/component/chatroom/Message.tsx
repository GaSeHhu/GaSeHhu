import React from 'react';

import { ListItem, ListItemAvatar, Grid, ListItemText, Typography } from "@mui/material";
import { User } from "../../lib/User";
import { UserAvatar } from "../UserAvatar";

export default function Message(props: {
  whom: User;
  children: React.ReactNode;
  align: 'left' | 'right';
}) {
  return (
    <ListItem alignItems="flex-start" sx={{ textAlign: props.align }}>
      {
        props.align === 'left' && <ListItemAvatar sx={{ display: 'flex', justifyContent: 'left' }}>
          <UserAvatar user={props.whom}/>
        </ListItemAvatar>
      }
      <Grid container>
        <Grid item xs={12}>
          <ListItemText secondary={
            <>
              <Typography
                sx={{ display: 'inline' }}
                component="span"
                variant="body2"
                color="text.secondary"
              >
                {props.whom.nickname}
              </Typography>
            </>
          }/>
        </Grid>
        <Grid item xs={12}>
          <ListItemText primary={props.children}></ListItemText>
        </Grid>
      </Grid>
      {
        props.align === 'right' && <ListItemAvatar sx={{ display: 'flex', justifyContent: 'right' }}>
          <UserAvatar user={props.whom}/>
        </ListItemAvatar>
      }
    </ListItem>
  );
}
