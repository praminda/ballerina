/**
 * Copyright (c) 2018, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
 *
 * WSO2 Inc. licenses this file to you under the Apache License,
 * Version 2.0 (the "License"); you may not use this file except
 * in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied. See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
import React from 'react';
import PropTypes from 'prop-types';
import FunctionCtrl from './function-ctrl';

/**
 * class to render Next statement.
 * @extends React.Component
 * @class ActionCtrl
 * */
class ActionCtrl extends React.Component {

    /**
     * Render Function for the Next statement.
     * @return {React.Component} next node react component.
     * */
    render() {
        const node = this.props.model;
        if (node.id !== node.parent.initAction.id) {
            return (<FunctionCtrl model={this.props.model} />);
        }
        return <span />;
    }
}

ActionCtrl.propTypes = {
    model: PropTypes.instanceOf(Object).isRequired,
};

ActionCtrl.contextTypes = {
    config: PropTypes.instanceOf(Object).isRequired,
    command: PropTypes.shape({
        on: PropTypes.func,
        dispatch: PropTypes.func,
    }).isRequired,
    mode: PropTypes.string,
};

export default ActionCtrl;
