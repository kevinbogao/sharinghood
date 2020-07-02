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

import Notifications from './views/Notification/Notifications';
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
            path="/notifications/:id"
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

          .prev-p {
            display: block;
            font-size: 20px;
            color: $brown;
          }

          .main-p {
            display: block;
            font-size: 14px;
            color: $green-200;
          }

          .prev-input {
            display: block;
            background: $white;
            border-width: 0;
            padding: 10px;
            color: #a0998f;
            font-size: 20px;
            width: 280px;

            &.modal {
              margin-left: auto;
              margin-right: auto;
            }
          }

          .main-input {
            @extend .prev-input;
            max-width: 300px;

            @include sm {
              width: 70vw;
              max-width: 80vw;
            }

            &::placeholder {
              font-size: 17px;
            }
          }

          .prev-btn {
            height: 43px;
            width: 300px;
            background: $green-200;
            border-width: 0;
            border-radius: 4px;
            color: $background;
            font-family: $font-stack;
            font-size: 20px;

            @include sm {
              width: 100%;
            }

            &.block {
              display: block;
              margin: 30px auto auto auto;
            }

            &.bronze {
              background: $bronze-200;

              &:hover {
                cursor: pointer;
                background: $bronze-100;
              }
            }

            &.red {
              background: $red-200;

              &:hover {
                cursor: pointer;
                background: $red-100;
              }
            }

            &:hover {
              cursor: pointer;
              background: $green-100;
            }
          }

          .main-btn {
            min-width: 120px;
            display: block;
            margin: 30px auto 10px auto;
            padding: 7px 15px;
            background-color: $green-200;
            font-size: 16px;
            font-weight: 600;
            color: $background;
            border: none;
            border-radius: 10px;

            &:hover {
              cursor: pointer;
              background: $green-100;
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
            color: $brown;

            &:hover {
              background: $grey-100;
            }

            &.active {
              color: $green-100;
            }

            @include md {
              font-size: 17px;
            }
          }

          .switch-btn-separator {
            background: $brown;
            width: 2px;
          }

          .item-btn {
            width: max-content;
            height: 40px;
            border-width: 0;
            border-radius: 4px;
            cursor: pointer;
            color: #fff;
            font-size: 20px;
            margin: 20px auto;
            padding: 4px 18px;
          }

          .font-icon {
            font-size: 18px;

            &.green {
              color: $green-200;
            }
          }

          .modal-p {
            @extend .prev-p;
            margin: 20px auto;
          }

          .modal-btn {
            @extend .prev-btn;
            width: initial;
            height: initial;
            margin: 20px 20px 0 0;
            padding: 8px 15px;

            &.full {
              margin: 20px auto 20px auto;
              display: block;
              width: 300px;

              &.red {
                margin: 20px auto 20px auto;
                background: $red-200;

                &:hover {
                  background: $red-100;
                }
              }

              &.bronze {
                margin: 20px auto 20px auto;
                background: $bronze-200;

                &:hover {
                  background: $bronze-100;
                }
              }
            }

            &.red {
              display: block;
              margin: 20px 20px 0 0;
              background: $red-200;
            }

            &.bronze {
              display: block;
              margin: 20px 0;
              background: $bronze-200;
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
