import React, { PropTypes } from 'react'
import ReactTabs, { Tab, Tabs, TabList, TabPanel } from 'react-tabs'
import Response from './Response';
import Request from './Request';

// import moment from 'moment';

const ConnDetails = ({conn}) => {
  if(conn == null) {
    return <marquee><blink>set your proxy to localhost:4000</blink></marquee>;
  } else {
    return (
      <div className='details'>
        <Tabs selectedIndex={1}>
          <TabList>
            <Tab>Request</Tab>
            <Tab>Response</Tab>
          </TabList>

          <TabPanel>
            <Request conn={conn} />
          </TabPanel>
          <TabPanel>
            <Response conn={conn} />
          </TabPanel>
        </Tabs>
      </div>
    )
  }
}
ConnDetails.propTypes = {
  conn: PropTypes.object
}

export default ConnDetails;
