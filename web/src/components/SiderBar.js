import React, { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserContext } from '../context/User';

import { Button, Container, Icon, Menu, Segment } from 'semantic-ui-react';
import { API, getLogo, getSystemName, isAdmin, isMobile, showSuccess } from '../helpers';
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
import { Nav, Avatar, Dropdown, Layout } from '@douyinfe/semi-ui';

// HeaderBar Buttons
let headerButtons = [
    {
        text: '首页',
        itemKey: 'home',
        to: '/',
        icon: <IconHome />
    },
    {
        text: '渠道',
        itemKey: 'channel',
        to: '/channel',
        icon: <IconLayers />,
        className: isAdmin() ? 'semi-navigation-item-normal' : 'tableHiddle',
    },
    {
        text: '聊天',
        itemKey: 'chat',
        to: '/chat',
        icon: <IconComment />,
        className: localStorage.getItem('chat_link') ? 'semi-navigation-item-normal' : 'tableHiddle',
    },
    {
        text: '令牌',
        itemKey: 'token',
        to: '/token',
        icon: <IconKey />
    },
    {
        text: '兑换码',
        itemKey: 'redemption',
        to: '/redemption',
        icon: <IconGift />,
        className: isAdmin() ? 'semi-navigation-item-normal' : 'tableHiddle',
    },
    {
        text: '钱包',
        itemKey: 'topup',
        to: '/topup',
        icon: <IconCreditCard />
    },
    {
        text: '用户管理',
        itemKey: 'user',
        to: '/user',
        icon: <IconUser />,
        className: isAdmin() ? 'semi-navigation-item-normal' : 'tableHiddle',
    },
    {
        text: '日志',
        itemKey: 'log',
        to: '/log',
        icon: <IconHistogram />
    },
    {
        text: '绘图',
        itemKey: 'midjourney',
        to: '/midjourney',
        icon: <IconImage />
    },
    {
        text: '设置',
        itemKey: 'setting',
        to: '/setting',
        icon: <IconSetting />
    },
    // {
    //     text: '关于',
    //     itemKey: 'about',
    //     to: '/about',
    //     icon: <IconAt/>
    // }
];

const SiderBar = () => {
    const [userState, userDispatch] = useContext(UserContext);
    let navigate = useNavigate();
    const [selectedKeys, setSelectedKeys] = useState(['home']);

    // 根据屏幕大小初始化 showSidebar 状态
    const [isCollapsed, setIsCollapsed] = useState(!isMobile());

    const systemName = getSystemName();
    const logo = getLogo();

    async function logout() {
        setShowSidebar(false);
        await API.get('/api/user/logout');
        showSuccess('注销成功!');
        userDispatch({ type: 'logout' });
        localStorage.removeItem('user');
        navigate('/login');
    }

    return (
        <>
            <Layout>
                <div style={{ height: '100%' }}>
                    <Nav
                        mode={'horizontal'}
                        defaultIsCollapsed={isMobile()}
                        selectedKeys={selectedKeys}
                        renderWrapper={({ itemElement, isSubNav, isInSubNav, props }) => {
                            const routerMap = {
                                home: '/',
                                channel: '/channel',
                                token: '/token',
                                redemption: '/redemption',
                                topup: '/topup',
                                user: '/user',
                                log: '/log',
                                midjourney: '/midjourney',
                                setting: '/setting',
                                about: '/about',
                                chat: '/chat',
                            };
                            return (
                                <Link
                                    style={{ textDecoration: 'none' }}
                                    to={routerMap[props.itemKey]}
                                >
                                    {itemElement}
                                </Link>
                            );
                        }}
                        items={headerButtons}
                        onSelect={(key) => {
                            console.log(key);
                            setSelectedKeys([key.itemKey]);
                        }}
                        header={{
                            logo: <img src={logo} alt='logo' style={{ marginRight: '0.75em' }} />,
                            text: systemName,
                        }}
                        isCollapsed={isCollapsed} // 在这里连接状态
                        onCollapseChange={() => setIsCollapsed(!isCollapsed)} // 处理折叠状态的变化
                    >
                        <Nav.Footer collapseButton={true}>
                            {/* 切换侧边栏展开/折叠的按钮 */}
                            <div
                                onClick={() => setIsCollapsed(!isCollapsed)} // 单击时切换 isCollapsed 状态
                                style={{ cursor: 'pointer' }} // 可选: 更改光标以指示可单击
                            >
                                {isCollapsed ? <Icon name='angle double right' /> : <Icon name='angle double left' />}
                            </div>
                        </Nav.Footer>
                    </Nav>
                </div>
            </Layout>
        </>
    );
};

export default SiderBar;
