import React, { useEffect, useState } from 'react';
import { Button, Form, Input, Label, Message, Pagination, Popup, Table } from 'semantic-ui-react';
import { Link } from 'react-router-dom';
import { API, setPromptShown, shouldShowPrompt, showError, showInfo, showSuccess, timestamp2string } from '../helpers';

import { CHANNEL_OPTIONS, ITEMS_PER_PAGE } from '../constants';
import {renderGroup, renderNumber, renderQuota} from '../helpers/render';

function renderTimestamp(timestamp) {
  return (
    <>
      {timestamp2string(timestamp)}
    </>
  );
}

let type2label = undefined;

function renderType(type) {
  if (!type2label) {
    type2label = new Map;
    for (let i = 0; i < CHANNEL_OPTIONS.length; i++) {
      type2label[CHANNEL_OPTIONS[i].value] = CHANNEL_OPTIONS[i];
    }
    type2label[0] = { value: 0, text: '未知类型', color: 'grey' };
  }
  return <Label basic color={type2label[type]?.color}>{type2label[type]?.text}</Label>;
}

const ChannelsTable = () => {
  // ...省略部分代码...

  const renderStatus = (status) => {
    switch (status) {
      case 1:
        return <Label basic color='green'>已启用</Label>;
      case 2:
        return (
          <Popup
            trigger={<Label basic color='red'>
              已禁用
            </Label>}
            content='本渠道被手动禁用'
            basic
          />
        );
      case 3:
        return (
          <Popup
            trigger={<Label basic color='yellow'>
              已禁用
            </Label>}
            content='本渠道被程序自动禁用'
            basic
          />
        );
      default:
        return (
          <Label basic color='grey'>
            未知状态
          </Label>
        );
    }
  };

  const renderResponseTime = (responseTime) => {
    let time = responseTime / 1000;
    time = time.toFixed(2) + ' 秒';
    if (responseTime === 0) {
      return <Label basic color='grey'>未测试</Label>;
    } else if (responseTime <= 1000) {
      return <Label basic color='green'>{time}</Label>;
    } else if (responseTime <= 3000) {
      return <Label basic color='olive'>{time}</Label>;
    } else if (responseTime <= 5000) {
      return <Label basic color='yellow'>{time}</Label>;
    } else {
      return <Label basic color='red'>{time}</Label>;
    }
  };

  // ...省略部分代码...

  return (
    <>
      <Form onSubmit={searchChannels}>
        <Form.Input
          icon='search'
          fluid
          iconPosition='left'
          placeholder='搜索渠道的 ID，名称和密钥 ...'
          value={searchKeyword}
          loading={searching}
          onChange={handleKeywordChange}
        />
      </Form>
      {
        showPrompt && (
          <Message onDismiss={() => {
            setShowPrompt(false);
            setPromptShown("channel-test");
          }}>
            当前版本测试是通过按照 OpenAI API 格式使用 gpt-3.5-turbo
            模型进行非流式请求实现的，因此测试报错并不一定代表通道不可用，该功能后续会修复。

            另外，OpenAI 渠道已经不再支持通过 key 获取余额，因此余额显示为 0。对于支持的渠道类型，请点击余额进行刷新。
          </Message>
        )
      }
      <Table basic compact size='small'>
        <Table.Header>
          <Table.Row>
            <Table.HeaderCell
              style={{ cursor: 'pointer' }}
              onClick={() => {
                sortChannel('id');
              }}
            >
              ID
            </Table.HeaderCell>
            <Table.HeaderCell
              style={{ cursor: 'pointer' }}
              onClick={() => {
                sortChannel('name');
              }}
            >
              名称
            </Table.HeaderCell>
            <Table.HeaderCell
              style={{ cursor: 'pointer' }}
              onClick={() => {
                sortChannel('group');
              }}
              width={1}
            >
              分组
            </Table.HeaderCell>
            <Table.HeaderCell
              style={{ cursor: 'pointer' }}
              onClick={() => {
                sortChannel('type');
              }}
              width={2}
            >
              类型
            </Table.HeaderCell>
            <Table.HeaderCell
              style={{ cursor: 'pointer' }}
              onClick={() => {
                sortChannel('status');
              }}
              width={2}
            >
              状态
            </Table.HeaderCell>
            <Table.HeaderCell
              style={{ cursor: 'pointer' }}
              onClick={() => {
                sortChannel('response_time');
              }}
            >
              响应时间
            </Table.HeaderCell>
            <Table.HeaderCell>操作</Table.HeaderCell>
          </Table.Row>
        </Table.Header>

        <Table.Body>
          {channels
            .slice(
              (activePage - 1) * pageSize,
              activePage * pageSize
            )
            .map((channel, idx) => {
              if (channel.deleted) return <></>;
              return (
                <Table.Row key={channel.id}>
                  <Table.Cell>{channel.id}</Table.Cell>
                  <Table.Cell>{channel.name ? channel.name : '无'}</Table.Cell>
                  <Table.Cell>{renderGroup(channel.group)}</Table.Cell>
                  <Table.Cell>{renderType(channel.type)}</Table.Cell>
                  <Table.Cell>{renderStatus(channel.status)}</Table.Cell>
                  <Table.Cell>
                    <Popup
                      content={channel.test_time ? renderTimestamp(channel.test_time) : '未测试'}
                      key={channel.id}
                      trigger={renderResponseTime(channel.response_time)}
                      basic
                    />
                  </Table.Cell>
                  <Table.Cell>
                    <div>
                      <Button
                        size={'small'}
                        positive
                        onClick={() => {
                          testChannel(channel.id, channel.name, idx);
                        }}
                      >
                        测试
                      </Button>
                      <Popup
                        trigger={
                          <Button size='small' negative>
                            删除
                          </Button>
                        }
                        on='click'
                        flowing
                        hoverable
                      >
                        <Button
                          negative
                          onClick={() => {
                            manageChannel(channel.id, 'delete', idx);
                          }}
                        >
                          删除渠道 {channel.name}
                        </Button>
                      </Popup>
                      <Button
                        size={'small'}
                        onClick={() => {
                          manageChannel(
                            channel.id,
                            channel.status === 1 ? 'disable' : 'enable',
                            idx
                          );
                        }}
                      >
                        {channel.status === 1 ? '禁用' : '启用'}
                      </Button>
                      <Button
                        size={'small'}
                        as={Link}
                        to={'/channel/edit/' + channel.id}
                      >
                        编辑
                      </Button>
                    </div>
                  </Table.Cell>
                </Table.Row>
              );
            })}
        </Table.Body>

        <Table.Footer>
          <Table.Row>
            <Table.HeaderCell colSpan='7'>
              <Button size='small' as={Link} to='/channel/add' loading={loading}>
                添加新的渠道
              </Button>
              <Button size='small' loading={loading} onClick={testAllChannels}>
                测试所有已启用通道
              </Button>
              <div style={{ float: 'right' }}>
                <div className="ui labeled input" style={{marginRight: '10px'}}>
                  <div className="ui label">每页数量</div>
                  <Input type="number" style={{width: '70px'}} defaultValue={ITEMS_PER_PAGE} onBlur={setItemsPerPage}></Input>
                </div>
                <Pagination
                    activePage={activePage}
                    onPageChange={onPaginationChange}
                    size='small'
                    siblingRange={1}
                    totalPages={
                        Math.ceil(channels.length / pageSize) +
                        (channels.length % pageSize === 0 ? 1 : 0)
                    }
                />
              </div>
              <Popup
                trigger={
                  <Button size='small' loading={loading}>
                    删除禁用渠道
                  </Button>
                }
                on='click'
                flowing
                hoverable
              >
                <Button size='small' loading={loading} negative onClick={deleteAllDisabledChannels}>
                  确认删除
                </Button>
              </Popup>
              <Button size='small' onClick={refresh} loading={loading}>刷新</Button>

            </Table.HeaderCell>
          </Table.Row>
        </Table.Footer>
      </Table>
    </>
  );
};

export default ChannelsTable;
