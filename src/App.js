import * as React from 'react';
import PropTypes from 'prop-types';
import List from '@mui/material/List';
import Box from '@mui/material/Box';
import ListItem from '@mui/material/ListItem';
import Paper from '@mui/material/Paper';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Divider from '@mui/material/Divider';
import HomeIcon from '@mui/icons-material/Home';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import PieChartIcon from '@mui/icons-material/PieChart';
import BarChartIcon from '@mui/icons-material/BarChart';
import {
  Link as RouterLink,
  Route,
  Routes,
  MemoryRouter,
} from 'react-router-dom';
import { StaticRouter } from 'react-router-dom/server';
import Home from './pages/Home';
import Analysis1 from './pages/Analysis1';
import Analysis2 from './pages/Analysis2';
import Analysis3 from './pages/Analysis3';
import styled from '@emotion/styled';
import { Drawer } from '@mui/material';


function Router(props) {
  const { children } = props;
  if (typeof window === 'undefined') {
    return <StaticRouter location="/">{children}</StaticRouter>;
  }

  return (
    <MemoryRouter initialEntries={['/']} initialIndex={0}>
      {children}
    </MemoryRouter>
  );
}

Router.propTypes = {
  children: PropTypes.node,
};

function ListItemLink(props) {
  const { icon, primary, to } = props;

  const renderLink = React.useMemo(
    () =>
      React.forwardRef(function Link(itemProps, ref) {
        return <RouterLink to={to} ref={ref} {...itemProps} role={undefined} />;
      }),
    [to],
  );

  return (
    <li>
      <ListItem button component={renderLink}>
        {icon ? <ListItemIcon>{icon}</ListItemIcon> : null}
        <ListItemText primary={primary} />
      </ListItem>
    </li>
  );
}

ListItemLink.propTypes = {
  icon: PropTypes.element,
  primary: PropTypes.string.isRequired,
  to: PropTypes.string.isRequired,
};


const StyledPaper = styled(Paper)(
  `
  background: #34495E;
  color: white;
  `
);

export default function ListRouter() {
  return (
    <Router>
      <Box
        sx={{
          height: "100%",
          display: 'flex',
        }}
      >
        <Drawer
          sx={{
            width: '20%',
            flexShrink: 0,
            '& .MuiDrawer-paper': {
              width: '20%',
              boxSizing: 'border-box',
            },
          }}
          variant="permanent"
          anchor="left"
          PaperProps={{
            sx: {
              backgroundColor: "#34495E",
              color: "white",
            }
          }}
        >
          <StyledPaper elevation={0} aria-label="side bar">
            <List aria-label="main folders">
              <ListItemLink to="/" primary="Home" icon={<HomeIcon style={{ color: 'white' }} />} />
              <ListItemLink to="/Analysis1" primary="Analysis1" icon={<TrendingUpIcon style={{ color: 'white' }} />} />
            </List>
            <Divider />
            <List aria-label="secondary pages">
              <ListItemLink to="/Analysis2" primary="Analysis2" icon={<PieChartIcon style={{ color: 'white' }} />} />
              <ListItemLink to="/Analysis3" primary="Analysis3" icon={<BarChartIcon style={{ color: 'white' }} />} />
            </List>
          </StyledPaper>
        </Drawer>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/Analysis1" element={<Analysis1 />} />
          <Route path="/Analysis2" element={<Analysis2 />} />
          <Route path="/Analysis3" element={<Analysis3 />} />
        </Routes>
      </Box>
    </Router>
  );
}
