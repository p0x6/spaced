import React, { memo, useState, useEffect, useCallback } from 'react';
import Modal from '../Modal';
import { Image, Text, View } from 'react-native';
import colors from '../../constants/colors';
import { VictoryAxis, VictoryBar, VictoryChart } from 'victory-native';
import moment from 'moment';
import SafePathsAPI from '../../services/API';
import _ from 'lodash';

const activitylogIcon = require('../../assets/images/activitylog.png');

const ActivityLog = ({ modal, setModal }) => {
  const [interactions, setInteractions] = useState([]);

  useEffect(() => {
    if (modal === 'activity') {
      SafePathsAPI.getIntersections()
        .then(data => {
          const userInteractions = _.get(data, 'data', []);
          setInteractions(userInteractions.reverse());
        })
        .catch(e => {
          console.log('FAILED TO GET INTERSECTIONS: ', e);
          setInteractions([]);
        });
    }
    // setInteractions(
    //   [
    //     {
    //       count: 10,
    //       date: moment()
    //         .subtract(5, 'days')
    //         .format('YYYY-MM-DD'),
    //     },
    //     {
    //       count: 4,
    //       date: moment()
    //         .subtract(4, 'days')
    //         .format('YYYY-MM-DD'),
    //     },
    //     {
    //       count: 8,
    //       date: moment()
    //         .subtract(3, 'days')
    //         .format('YYYY-MM-DD'),
    //     },
    //     {
    //       count: 2,
    //       date: moment()
    //         .subtract(2, 'days')
    //         .format('YYYY-MM-DD'),
    //     },
    //     {
    //       count: 9,
    //       date: moment()
    //         .subtract(1, 'days')
    //         .format('YYYY-MM-DD'),
    //     },
    //     {
    //       count: 11,
    //       date: moment().format('YYYY-MM-DD'),
    //     },
    //   ],
    // );
  }, [modal]);

  if (modal !== 'activity' || interactions.length < 1) return null;

  return (
    <Modal exitModal={() => setModal(null)}>
      <View
        style={{
          width: '100%',
          paddingBottom: 12,
          alignItems: 'center',
          justifyContent: 'center',
        }}>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'flex-start',
            alignItems: 'center',
            width: '100%',
          }}>
          <Image
            source={activitylogIcon}
            style={{
              width: 25,
              height: 30,
              resizeMode: 'stretch',
              marginRight: 16,
            }}
          />
          <Text style={{ fontSize: 14, color: colors.BLACK }}>
            Activity{'\n'}Log
          </Text>
        </View>
        <View style={{ marginTop: 20, width: '100%' }}>
          <Text
            style={{
              color: colors.BLUE_TEXT_COLOR,
              fontFamily: 'DMSans-Regular',
              fontSize: 16,
              letterSpacing: 1,
            }}>
            Shows the number of people you had contact with
          </Text>
        </View>
        <View style={{ marginTop: 20, width: '100%' }}>
          <Text
            style={{
              color: colors.BLUE_TEXT_COLOR,
              fontFamily: 'DMSans-Bold',
              fontSize: 16,
              letterSpacing: 1,
            }}>
            Past 7 Days
          </Text>
        </View>
        <View style={{}}>
          <VictoryChart
            domainPadding={{ x: 32 }}
            height={216}
            padding={{ left: 24, right: 24, top: 24, bottom: 36 }}>
            <VictoryAxis
              orientation='right'
              dependentAxis
              style={{
                axis: { stroke: 'transparent' },
                grid: {
                  stroke: ({ tick }) => (tick === 6 ? '#999' : '#ccc'),
                  strokeDasharray: ({ tick }) => (tick === 6 ? [8, 4] : null),
                },
                tickLabels: { fontSize: 12, dx: -20, dy: -4, fill: '#aaa' },
              }}
            />
            <VictoryAxis
              style={{
                axis: { stroke: '#ccc' },
                tickLabels: { fontSize: 12 },
              }}
              tickFormat={t =>
                t ? `${moment(t, 'YYYY-MM-DD').format('MM/DD')}` : ''
              }
            />
            <VictoryBar
              alignment='middle'
              barWidth={28}
              height={100}
              style={{
                data: {
                  fill: ({ datum }) =>
                    datum.date === moment().format('YYYY-MM-DD')
                      ? '#FF8649'
                      : '#7BC0FB',
                },
              }}
              data={interactions}
              x='date'
              y='count'
            />
          </VictoryChart>
        </View>
        <View style={{ width: '100%', height: 44 }}>
          <View
            style={{
              backgroundColor: 'rgba(175, 186, 205, 0.27)',
              position: 'absolute',
              padding: 12,
              left: -12,
              right: -12,
            }}>
            <Text
              style={{
                color: colors.BLUE_TEXT_COLOR,
                fontFamily: 'DMSans-Bold',
                fontSize: 16,
                letterSpacing: 1,
              }}>
              Intersections today
            </Text>
          </View>
        </View>
        <View
          style={{
            width: '100%',
            flexDirection: 'row',
            marginTop: 24,
            justifyContent: 'flex-start',
            alignItems: 'center',
          }}>
          <Text
            style={{
              color: '#777',
              fontFamily: 'DMSans-Bold',
              fontSize: 18,
              marginRight: 40,
            }}>
            {moment(
              interactions[interactions.length - 1].date,
              'YYYY-MM-DD',
            ).format('dddd M/DD')}
          </Text>
          <Text
            style={{
              color: colors.BLUE_TEXT_COLOR,
              fontFamily: 'DMSans-Bold',
              fontSize: 36,
            }}>
            {interactions[interactions.length - 1].count.toString()}
          </Text>
        </View>
      </View>
    </Modal>
  );
};

export default memo(ActivityLog);
