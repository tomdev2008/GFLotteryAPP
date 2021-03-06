import React from 'react';
import PropTypes from 'prop-types';
import {View, ListView} from 'react-native';
import {connect} from 'react-redux';
import K3Cell from '../../../components/TabHistoryCells/kuai3cell';
import * as K3ListActions from '../../../actions/history/k3';
import LotteryToolBar from '../../../components/Views/LotteryToolBar';
import CommonNaviBar from '../../../components/Views/CommonNaviBar';
import {LoadMoreStatus} from '../../../components/Views/LDRLScroll/LDLoadMoreRefresh';
import LDCPHistoryListView from '../../../components/Views/LDCPHistoryListView';
import * as GlobalHelper from '../../../utils/GlobalHelper';
import BaseComponent from '../../../components/Views/BaseComponent';

class K3HistoryList extends BaseComponent {
    static navigationOptions = ({navigation}) => ({
        title: GlobalHelper.getCNNameFor(navigation.state.params.gameEn)
    });
    static propTypes = {
        gameEn: PropTypes.string,
        isRefreshing: PropTypes.bool,
        historyItems: PropTypes.array,
        hasNextPage: PropTypes.bool,
        isEmpty: PropTypes.bool,
        refreshAction: PropTypes.func.isRequired,
        getLatestTwentyAwards: PropTypes.func.isRequired,
        clearData: PropTypes.func.isRequired,
        getNextPageAwards: PropTypes.func.isRequired,
    };

    static defaultProps = {
        isRefreshing: false,
        historyItems: [],
        hasNextPage: false,
        isEmpty: true,
    };

    constructor(props) {
        super(props);
        this.functionBindThis();
        this.state = ({
            gameEn: this.props.navigation.state.params.gameEn,
            periodName: this.props.navigation.state.params.periodName,
        })
    }

    componentDidMount() {
        this.props.refreshAction();
        this.props.getLatestTwentyAwards(this.state.gameEn, this.state.periodName);
    }

    componentWillReceiveProps(nextProps) {
        if (!nextProps.isRefreshing) {
            this.listView.endRefresh();
        }
        if (nextProps.historyItems.length > 0) {
            this.listView.setLoadMoreStatus(LoadMoreStatus.idle);
        }
    }

    componentWillUnmount() {
        this.props.clearData();
    }

    // 下拉刷新
    onRefresh() {
        this.props.getLatestTwentyAwards(this.state.gameEn, this.state.periodName);
    }

    // 上拉加载更多
    onEndReached() {
        if (this.props.hasNextPage && this.props.historyItems && this.props.historyItems.length !== 0) {
            this.props.getNextPageAwards(
                this.state.gameEn,
                this.props.historyItems[this.props.historyItems.length - 1].periodName,
            );
        }
    }

    functionBindThis() {
        this.onRefresh = this.onRefresh.bind(this);
        this.onEndReached = this.onEndReached.bind(this);
        this.renderRow = this.renderRow.bind(this);
    }

    renderRow(rowData, sectionID, rowID) {
        return (<K3Cell gameEn={this.state.gameEn} rowData={rowData} row={rowID} cellStyle="historyList"/>);
    }

    render() {
        const ds = new ListView.DataSource({
            rowHasChanged: (r1, r2) => r1 !== r2,
        });
        const {historyItems} = this.props;
        return (
            <View style={{flex: 1}}>
                <LDCPHistoryListView
                    ref={(ref) => {
                        this.listView = ref;
                    }}
                    renderRow={this.renderRow}
                    dataSource={ds.cloneWithRows(historyItems)}
                    automaticallyAdjustContentInsets={false}
                    horizontal={false}
                    onRefresh={this.onRefresh}
                    onLoadMore={this.onEndReached}
                    isShowLoadMore={this.props.hasNextPage}
                    enableEmptySections
                    renderHeader={this.renderHeader}
                    empty={this.props.isEmpty}
                    isRefreshing={this.props.isRefreshing}
                />
                <LotteryToolBar gameEn={this.state.gameEn}/>
            </View>
        );
    }
}

// 选择store中的state注入props
function mapStateToProps(store) {
    const K3HistoryListReducer = store.K3HistoryListReducer.toJS();
    return {
        isRefreshing: K3HistoryListReducer.isRefreshing,
        historyItems: K3HistoryListReducer.historyItems,
        hasNextPage: K3HistoryListReducer.hasNextPage,
        isEmpty: K3HistoryListReducer.isEmpty,
    };
}

// 选择注入到prop中的回调方法
function mapDispatchToProps(dispatch) {
    return {
        refreshAction: () => dispatch(K3ListActions.refreshAction()),
        getLatestTwentyAwards: (gameEn, periodName) => dispatch(K3ListActions.getRefreshDataAction(gameEn, periodName)),
        getNextPageAwards: (gameEn, lastPeriod) => dispatch(K3ListActions.getNextPageAwardsAction(gameEn, lastPeriod)),
        clearData: () => dispatch(K3ListActions.clearDataAction()),
    };
}

// 生成容器组件K3HistoryList
export default connect(mapStateToProps, mapDispatchToProps)(K3HistoryList);
