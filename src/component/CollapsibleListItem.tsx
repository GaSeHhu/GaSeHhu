import React, { useState } from 'react';

import { ExpandLess, ExpandMore } from '@mui/icons-material';
import { Collapse, ListItemButton, ListItemText, ListItemTextProps } from '@mui/material';

export default function CollapsibleListItem(props: {
  headerTextProps?: ListItemTextProps;
  children?: React.ReactNode;
}) {
  const [show, setShow] = useState<boolean>(true);
  const flip = () => setShow(prev => !prev);
  return (
    <>
      <ListItemButton onClick={flip}>
        <ListItemText {...props.headerTextProps} />
        {show ? <ExpandLess /> : <ExpandMore />}
      </ListItemButton>
      <Collapse in={show} timeout="auto" unmountOnExit>
        {props.children}
      </Collapse>
    </>
  );
}
