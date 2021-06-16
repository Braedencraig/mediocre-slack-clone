import React, { useEffect, useState } from 'react'
import './Sidebar.css'
import FiberManualRecordIcon from '@material-ui/icons/FiberManualRecord';
import CreateIcon from '@material-ui/icons/Create';
import SidebarOption from "./SidebarOption"
import InsertCommentIcon from '@material-ui/icons/InsertComment';
import InboxIcon from '@material-ui/icons/Inbox';
import DraftsIcon from '@material-ui/icons/Drafts';
import BookmarkBorderIcon from '@material-ui/icons/BookmarkBorder';
import PeopleAltIcon from '@material-ui/icons/PeopleAlt';
import AppsIcon from '@material-ui/icons/Apps';
import FileCopyIcon from '@material-ui/icons/FileCopy';
import ExpandLessIcon from '@material-ui/icons/ExpandLess';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import AddIcon from '@material-ui/icons/Add';
import db from './firebase'
import Pusher from 'pusher-js'


import axios from './axios'
import { useStateValue } from './StateProvider';

const Sidebar = () => {
    const [channels, setChannels] = useState([]);
    const [{ user }] = useStateValue()

    const pusher = new Pusher('ed06a97ccd4ab93ef10b', {
        cluster: 'us2'
    });

    const getChannelList = () => {
        axios.get('http://localhost:9000/get/channelList').then(res => {
            setChannels(res.data)
        })
    }

    useEffect(() => {
        getChannelList()

        const channel = pusher.subscribe('channels');
        channel.bind('newChannel', function(data) {
            getChannelList()
        });

        
    }, [])

    return (
        <div className='sidebar' >
            <div className="sidebar__header">
                <div className="sidebar__info">
                    <h3>
                        <FiberManualRecordIcon />
                        {user.displayName}
                    </h3>
                </div>
                <CreateIcon />
            </div>
            <SidebarOption Icon={InsertCommentIcon} title="Threads" />
            <SidebarOption Icon={InboxIcon} title="Mentions & reactions" />
            <SidebarOption Icon={DraftsIcon} title="Saved items" />
            <SidebarOption Icon={BookmarkBorderIcon} title="Channel browser" />
            <SidebarOption Icon={PeopleAltIcon} title="People & user groups" />
            <SidebarOption Icon={AppsIcon} title="Apps" />
            <SidebarOption Icon={FileCopyIcon} title="File browser" />
            <SidebarOption Icon={ExpandLessIcon} title="Show less" />
            <SidebarOption title='YouTube' />
            <hr />
            <SidebarOption Icon={ExpandMoreIcon} title="Channels" />
            <hr />
            <SidebarOption Icon={AddIcon} addChannelOption title="Add Channel" />

            {
                channels.map(channel => (
                    <SidebarOption title={channel.name} id={channel.id} />
                )
                )
            }

        </div>
    )
}

export default Sidebar
