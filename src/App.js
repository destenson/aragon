import React from 'react'
import createHistory from 'history/createHashHistory'
import { styled, AragonApp } from '@aragon/ui'
import MenuPanel from './components/MenuPanel/MenuPanel'
import Home from './components/Home/Home'
import Permissions from './components/Permissions/Permissions'
import { apps, notifications, tokens, prices, homeActions } from './demo-state'

class App extends React.Component {
  state = {
    path: '',
    search: '',
    sidePanelOpened: false,
    notifications,
  }
  constructor() {
    super()
    this.history = createHistory()
    this.state.path = this.history.location.pathname
    this.state.search = this.history.location.search || ''
    this.history.listen(this.handleNavigation)
  }
  appInstance() {
    const matches = this.state.path.match(/^\/?(\w+)\/?(\w+)?/)
    if (!matches) {
      return { appId: 'home', instanceId: '' }
    }

    const { search } = this.state
    const params = search && search.split('?params=')[1]
    return {
      appId: matches[1],
      instanceId: matches[2],
      params: params ? JSON.parse(decodeURIComponent(params)) : null,
    }
  }
  changePath = (path, search = '') => {
    const { state } = this
    if (path !== state.path || search !== state.search) {
      this.history.push(path + search)
    }
  }
  handleNavigation = ({ pathname, search }) => {
    this.setState({ path: pathname, search })
  }
  handleParamsRequest = params => {
    const { appId, instanceId } = this.appInstance()
    this.openApp(
      appId,
      instanceId,
      params ? encodeURIComponent(JSON.stringify(params)) : null
    )
  }
  openApp = (appId, instanceId, params) => {
    if (appId === 'home') {
      this.changePath('/')
      return
    }

    if (appId === 'settings') {
      this.changePath('/settings')
      return
    }

    // Get the first instance found if instanceId is not passed
    const app = apps.find(app => app.id === appId)

    const instances = (app && app.instances) || []
    const instance = instanceId
      ? instances.find(({ id }) => id === instanceId)
      : instances[0]

    this.changePath(
      `/${appId}${instance ? `/${instance.id}` : ''}`,
      params ? `?params=${params}` : ''
    )
  }
  openSidePanel = () => {
    this.setState({ sidePanelOpened: true })
  }
  closeSidePanel = () => {
    this.setState({ sidePanelOpened: false })
  }
  render() {
    const { notifications } = this.state
    const { appId, instanceId, params } = this.appInstance()
    return (
      <AragonApp publicUrl="/aragon-ui/">
        <Main>
          <MenuPanel
            apps={apps}
            activeAppId={appId}
            activeInstanceId={instanceId}
            notifications={notifications}
            onOpenApp={this.openApp}
          />
          <AppScreen>
            {appId === 'home' && (
              <Home
                tokens={tokens}
                prices={prices}
                actions={homeActions}
                onOpenApp={this.openApp}
              />
            )}
            {appId === 'permissions' && (
              <Permissions
                apps={apps}
                params={params}
                onParamsRequest={this.handleParamsRequest}
              />
            )}
          </AppScreen>
        </Main>
      </AragonApp>
    )
  }
}

const Main = styled.div`
  display: flex;
  align-items: stretch;
  height: 100vh;
`

const AppScreen = styled.div`
  flex-grow: 1;
  width: 100%;
  height: 100%;
  overflow: auto;
`

export default App
