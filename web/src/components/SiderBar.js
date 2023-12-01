import React, {useContext, useState} from 'react';
import {Link, useNavigate, useLocation} from 'react-router-dom';
import {UserContext} from '../context/User';

import {Button, Container, Icon, Menu, Segment} from 'semantic-ui-react';
import {API, getLogo, getSystemName, isAdmin, isMobile, showSuccess} from '../helpers';
import '../index.css';

import {
    IconAt,
    IconHistogram,
    IconGift,
    IconKey,
    IconUser,
    IconLayers,
    IconSetting,
    IconCreditCard,
    IconComment,
    IconHome,
    IconImage
} from '@douyinfe/semi-icons';
import {Nav, Avatar, Dropdown, Layout} from '@douyinfe/semi-ui';

let headerButtons = [
    {
        text: '首页',
        itemKey: 'home',
        to: '/',
        icon: <IconHome/>
    },
    {
        text: '渠道',
        itemKey: 'channel',
        to: '/channel',
        icon: <IconLayers/>,
        className: isAdmin()?'semi-navigation-item-normal':'tableHiddle',
    },
    {
        text: '聊天',
        itemKey: 'chat',
        to: '/chat',
        icon: <IconComment />,
        className: localStorage.getItem('chat_link')?'semi-navigation-item-normal':'tableHiddle',
    },
    {
        text: '令牌',
        itemKey: 'token',
        to: '/token',
        icon: <IconKey/>
    },
    {
        text: '兑换码',
        itemKey: 'redemption',
        to: '/redemption',
        icon: <IconGift/>,
        className: isAdmin()?'semi-navigation-item-normal':'tableHiddle',
    },
    {
        text: '钱包',
        itemKey: 'topup',
        to: '/topup',
        icon: <IconCreditCard/>
    },
    {
        text: '用户管理',
        itemKey: 'user',
        to: '/user',
        icon: <IconUser/>,
        className: isAdmin()?'semi-navigation-item-normal':'tableHiddle',
    },
    {
        text: '日志',
        itemKey: 'log',
        to: '/log',
        icon: <IconHistogram/>
    },
    {
        text: '绘图',
        itemKey: 'midjourney',
        to: '/midjourney',
        icon: <IconImage/>
    },
    {
        text: '设置',
        itemKey: 'setting',
        to: '/setting',
        icon: <IconSetting/>
    },
];

const SiderBar = () => {
    const [userState, userDispatch] = useContext(UserContext);
    let navigate = useNavigate();
    const [selectedKeys, setSelectedKeys] = useState(['home']);
    let location = useLocation();

    const pathsToShowSidebar = ['/', '/topup','/setting'];
    const shouldShowSidebar = pathsToShowSidebar.includes(location.pathname);
    const [showSidebar, setShowSidebar] = useState(shouldShowSidebar);

    const systemName = getSystemName();
    const logo = getLogo();

    async function logout() {
        setShowSidebar(false);
        await API.get('/api/user/logout');
        showSuccess('注销成功!');
        userDispatch({type: 'logout'});
        localStorage.removeItem('user');
        navigate('/login');
    }

    return (
        <>
            <Layout>
                <div style={{height: '100%'}}>
                    <Nav
                        defaultIsCollapsed={!showSidebar}
                        selectedKeys={selectedKeys}
                        renderWrapper={({itemElement, isSubNav, isInSubNav, props}) => {
                            const routerMap = {
                                home: "/",
                                channel: "/channel",
                                token: "/token",
                                redemption: "/redemption",
                                topup: "/topup",
                                user: "/user",
                                log: "/log",
                                midjourney: "/midjourney",
                                setting: "/setting",
                                about: "/about",
                                chat: "/chat",
                            };
                            return (
                                <Link
                                    style={{textDecoration: "none"}}
                                    to={routerMap[props.itemKey]}
                                >
                                    {itemElement}
                                </Link>
                            );
                        }}
                        items={headerButtons}
                        onSelect={key => {
                            setSelectedKeys([key.itemKey]);
                        }}
                        header={{
                            logo: <img src={logo} alt='logo' style={{marginRight: '0.75em'}}/>,
                            text: systemName,
                        }}
                    >
                        <Nav.Footer collapseButton={true}>
                        </Nav.Footer>
                    </Nav>
                </div>
            </Layout>
        </>
    );
};

export default SiderBar;
