/*
 * Copyright (c) 2016, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
 *
 * WSO2 Inc. licenses this file to you under the Apache License,
 * Version 2.0 (the "License"); you may not use this file except
 * in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

package org.wso2.ballerina.core.model.statements;

import org.wso2.ballerina.core.interpreter.Context;
import org.wso2.ballerina.core.model.NodeVisitor;
import org.wso2.ballerina.core.model.expressions.FunctionInvocationExpr;

/**
 * An {@code FunctionInvocationStmt} represents a function invocation.
 *
 * @since 1.0.0
 */
public class FunctionInvocationStmt implements Statement {

    private FunctionInvocationExpr functionInvocationExpr;

    private FunctionInvocationStmt(FunctionInvocationExpr functionInvocationExpr) {
        this.functionInvocationExpr = functionInvocationExpr;
    }

    public FunctionInvocationExpr getFunctionInvocationExpr() {
        return functionInvocationExpr;
    }

    @Override
    public void accept(NodeVisitor visitor) {
        visitor.visit(this);
    }

    @Override
    public void interpret(Context ctx) {

    }

    /**
     * Builds a {@code FunctionInvokeStmt} statement
     *
     * @since 1.0.0
     */
    public static class FunctionInvokeStmtBuilder {
        private FunctionInvocationExpr functionInvocationExpr;

        public FunctionInvokeStmtBuilder() {
        }

        public void setFunctionInvocationExpr(FunctionInvocationExpr functionInvocationExpr) {
            this.functionInvocationExpr = functionInvocationExpr;
        }

        public FunctionInvocationStmt build() {
            return new FunctionInvocationStmt(this.functionInvocationExpr);
        }
    }
}

