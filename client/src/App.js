import React from 'react';
import { BrowserRouter, Route, Switch } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './views/Home';
import { Posts } from './views/Post/Posts';
import { Navbar } from './components/Navbar';
import Profile from './views/User/Profile';
import Login from './views/User/Login';
import Register from './views/User/Register';
import { Requests } from './views/Request/Requests';
import Dashboard from './views/Dashboard';
import DashboardDetails from './views/DashboardDetails';
import CreatePost from './views/Post/CreatePost';
import PostDetails from './views/Post/PostDetails';
import CreateRequest from './views/Request/CreateRequest';
import CommunityLink from './views/Community/CommunityLink';
import CommunityInvite from './views/Community/CommunityInvite';
import RequestDetails from './views/Request/RequestDetails';
import CreateCommunity from './views/Community/CreateCommunity';
import CommunityExists from './views/Community/CommunityExists';
import ResetPassword from './views/User/ResetPassword';
import ForgotPassword from './views/User/ForgotPassword';
import SelectCommunity from './views/Community/SelectCommunity';
import EditPost from './views/Post/EditPost';

import { Notifications } from './views/Notification/Notifications';
import NotificationDetails from './views/Notification/NotificationDetails';

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <div className="base-control">
        <Route exact path="/" component={Home} />
        <Route exact path="/register" component={Register} />
        <Route exact path="/create-community" component={CreateCommunity} />
        <Route exact path="/community-link" component={CommunityLink} />
        <Route exact path="/find-community" component={CommunityExists} />
        <Route
          exact
          path="/community/:communityCode"
          component={CommunityInvite}
        />
        <Route exact path="/reset-password/:id" component={ResetPassword} />
        <Route exact path="/forgot-password" component={ForgotPassword} />
        <Switch>
          <Route path="/login" component={Login} />
          <ProtectedRoute path="/find" component={Posts} />
          <ProtectedRoute path="/profile" component={Profile} />
          <ProtectedRoute path="/share" component={CreatePost} />
          <ProtectedRoute path="/communities" component={SelectCommunity} />
          <ProtectedRoute
            exact
            path="/notifications"
            component={Notifications}
          />
          <ProtectedRoute
            exact
            path="/notification/:id"
            component={NotificationDetails}
          />
          <ProtectedRoute exact path="/dashboard" component={Dashboard} />
          <ProtectedRoute
            exact
            path="/dashboard/:id"
            component={DashboardDetails}
          />
          <ProtectedRoute path="/request" component={CreateRequest} />
          <ProtectedRoute exact path="/shared/:id" component={PostDetails} />
          <ProtectedRoute exact path="/shared/:id/edit" component={EditPost} />
          <ProtectedRoute exact path="/requests" component={Requests} />
          <ProtectedRoute
            exact
            path="/requests/:id"
            component={RequestDetails}
          />
        </Switch>
      </div>
      <style jsx global>
        {`
          @import './src/assets/scss/index.scss';

          html,
          body,
          * {
            font-family: $font-stack;
            margin: 0;
            padding: 0;
            text-decoration: none;
          }

          button {
            &:hover {
              cursor: pointer;
            }
          }

          a {
            color: inherit;
            text-decoration: none;
          }

          .main-p {
            display: block;
            font-size: 20px;
            margin: 20px auto;
            color: $black;
            max-width: 300px;

            &.new {
              margin: 14px 0 7px 0;
              font-size: 14px;

              @include sm {
                max-width: 240px;
              }
            }
          }

          .main-input {
            display: block;
            background: $grey-000;
            margin-top: 30px;
            border-width: 0;
            padding: 10px;
            color: #a0998f;
            font-size: 20px;
            width: 280px;

            &.modal {
              margin: 0 auto;
            }

            &.date {
              margin: 0 auto;
            }

            &.new {
              margin: initial;
              max-width: 300px;

              @include sm {
                width: 70vw;
                max-width: 80vw;
              }

              &::placeholder {
                font-size: 17px;
              }
            }
          }

          .main-select {
            font-size: 18px;
            padding-left: 10px;
            color: #a0998f;
            width: 300px;
            height: 40px;
            border-width: 0px;
            background: $grey-000;
            border-radius: 4px;
            margin-bottom: 12px;

            @include sm {
              width: 100%;
            }
          }

          .main-btn {
            height: 43px;
            width: 300px;
            background: $orange;
            border-width: 0;
            border-radius: 4px;
            color: $background;
            font-family: $font-stack;
            font-size: 20px;

            &.block {
              display: block;
              margin: 30px auto auto auto;
            }

            &.modal {
              display: block;
              margin: 20px auto 20px auto;
              padding: 8px 15px;
            }

            &.grey {
              background: $grey-300;
            }

            &.beige {
              background: $beige;
            }

            &.new {
              height: initial;
              width: initial;
              min-width: 120px;
              display: block;
              margin: 30px auto 10px auto;
              padding: 7px 15px;
              font-size: 16px;
              font-weight: 600;
              color: $background;
              border: none;
              border-radius: 10px;
            }

            &.item {
              width: max-content;
              height: 40px;
              border-width: 0;
              border-radius: 4px;
              cursor: pointer;
              color: $background;
              font-size: 20px;
              margin: 20px auto;
              padding: 4px 18px;
            }
          }

          .switch-btn {
            margin: 0 auto;
            display: block;
            font-size: 18px;
            background: none;
            border-width: 0;
            cursor: pointer;
            width: 100%;
            padding: 5px;
            color: $black;

            &:hover {
              background: $grey-100;
            }

            &.active {
              color: $orange;
            }

            @include md {
              font-size: 17px;
            }
          }

          .switch-btn-separator {
            background: $grey-300;
            width: 2px;
          }

          .noti-btn {
            border: none;
            color: $black;
            font-size: 17px;
            width: 85px;
            height: 30px;
            border-radius: 15px;

            &.status {
              width: 160px;
            }

            &.pending {
              border: 2px solid $beige;
              background: $background;
            }

            &.accept {
              border: 2px solid $green-100;
              background: $green-000;
            }

            &.deny {
              border: 2px solid $red-100;
              background: $red-000;
            }

            &.request {
              border: 2px solid $black;
              background: $background;
            }
          }

          .font-icon {
            font-size: 18px;

            &.orange {
              color: $orange;
            }
          }

          #root {
            height: 100vh;
            display: flex;
            flex-direction: column;
          }

          .base-control {
            // margin-top: 4px;
            margin-top: 3px;
            flex: 1 1 0%;
            display: flex;
            overflow-y: scroll;
          }
        `}
      </style>
    </BrowserRouter>
  );
}

export default App;
