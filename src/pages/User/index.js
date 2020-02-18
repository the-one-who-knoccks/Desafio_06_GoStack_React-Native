/* eslint-disable react/prop-types */
/* eslint-disable react/no-unused-state */
import React, {Component} from 'react';
import {ActivityIndicator, TouchableWithoutFeedback} from 'react-native';
import PropTypes from 'prop-types';
import api from '../../services/api';

import {
  Container,
  Header,
  Avatar,
  Name,
  Bio,
  Stars,
  Starred,
  OwnerAvatar,
  Info,
  Title,
  Author,
} from './styles';

export default class User extends Component {
  static navigationOptions = ({navigation}) => ({
    title: navigation.getParam('user').name,
    headerTitleAlign: 'Center',
  });

  static propTypes = {
    navigation: PropTypes.shape({
      getParam: PropTypes.func,
    }).isRequired,
  };

  state = {
    stars: [],
    isFetching: false,
    page: 1,
  };

  async componentDidMount() {
    const {navigation} = this.props;
    const {page} = this.state;
    const user = navigation.getParam('user');
    this.setState({isFetching: true});

    const response = await api.get(`/users/${user.login}/starred`, {
      params: {
        page,
      },
    });

    this.setState({
      stars: Array.from(response.data),
      isFetching: false,
    });
  }

  loadScroll = async login => {
    const {stars, page} = this.state;
    if (stars.length < page * 30) {
      return;
    }
    const response = await api.get(`/users/${login}/starred`, {
      params: {
        page: page + 1,
      },
    });
    const data = Array.from(response.data);
    const starsAdd = [...stars, ...data];
    this.setState({
      stars: starsAdd,
      page: page + 1,
    });
  };

  onRefresh = async () => {
    this.setState({isFetching: true});
    const {navigation} = this.props;
    const user = navigation.getParam('user');
    const response = await api.get(`/users/${user.login}/starred`, {
      params: {
        page: 1,
      },
    });
    this.setState({
      stars: Array.from(response.data),
      page: 1,
      isFetching: false,
    });
  };

  handleNavigate = repository => {
    const {navigation} = this.props;

    navigation.navigate('Repository', {repository});
  };

  render() {
    const {navigation} = this.props;
    const {stars, isFetching} = this.state;
    const user = navigation.getParam('user');

    return (
      <Container>
        <Header>
          <Avatar source={{uri: user.avatar}} />
          <Name>{user.name}</Name>
          <Bio>{user.bio}</Bio>
        </Header>
        {isFetching ? (
          <ActivityIndicator color="#7159c1" size="large" />
        ) : (
          <Stars
            onRefresh={this.onRefresh}
            refreshing={isFetching}
            onEndReachedThreshold={0.2}
            onEndReached={() => this.loadScroll(user.login)}
            data={stars}
            keyExtractor={star => String(star.id)}
            renderItem={({item}) => (
              <TouchableWithoutFeedback
                onPress={() => this.handleNavigate(item)}>
                <Starred>
                  <OwnerAvatar source={{uri: item.owner.avatar_url}} />
                  <Info>
                    <Title>{item.name}</Title>
                    <Author>{item.owner.login}</Author>
                  </Info>
                </Starred>
              </TouchableWithoutFeedback>
            )}
          />
        )}
      </Container>
    );
  }
}
