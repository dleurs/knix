#!/bin/bash
#   Copyright 2020 The KNIX Authors
#
#   Licensed under the Apache License, Version 2.0 (the "License");
#   you may not use this file except in compliance with the License.
#   You may obtain a copy of the License at
#
#       http://www.apache.org/licenses/LICENSE-2.0
#
#   Unless required by applicable law or agreed to in writing, software
#   distributed under the License is distributed on an "AS IS" BASIS,
#   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
#   See the License for the specific language governing permissions and
#   limitations under the License.

# Add standard config items
sed -i -r 's/^nodename .*$//' $RIAK_CONF
sed -i -r 's/^distributed_cookie .*$//' $RIAK_CONF
sed -i -r 's/^listener\.protobuf\.internal .*$//' $RIAK_CONF
sed -i -r 's/^listener\.http\.internal .*$//' $RIAK_CONF
sed -i -r 's/^erlang\.distribution\.port_range\.minimum .*$//' $RIAK_CONF
sed -i -r 's/^erlang\.distribution\.port_range\.maximum .*$//' $RIAK_CONF
sed -i -r 's/^log\.console\.level .*$//' $RIAK_CONF
sed -i -r 's/^bitcask\.merge\.policy .*$//' $RIAK_CONF
sed -i -r 's/^bitcask\.merge\.triggers\.fragmentation .*$//' $RIAK_CONF
sed -i -r 's/^bitcask\.merge\.triggers\.dead_bytes .*$//' $RIAK_CONF
sed -i -r 's/^bitcask\.merge\.thresholds\.fragmentation .*$//' $RIAK_CONF
sed -i -r 's/^bitcask\.merge\.thresholds\.dead_bytes .*$//' $RIAK_CONF
sed -i -r 's/^bitcask\.merge\.thresholds\.small_file .*$//' $RIAK_CONF
sed -i -r 's/^bitcask\.merge_check_interval .*$//' $RIAK_CONF
sed -i -r 's/^bitcask\.max_file_size .*$//' $RIAK_CONF

cat <<END >>$RIAK_CONF
nodename = riak@$HOST
distributed_cookie = $CLUSTER_NAME
listener.protobuf.internal = $HOST:$PB_PORT
listener.http.internal = $HOST:$HTTP_PORT
erlang.distribution.port_range.minimum = $ERLANG_DISTRIBUTION_PORT_RANGE_MINIMUM
erlang.distribution.port_range.maximum = $ERLANG_DISTRIBUTION_PORT_RANGE_MAXIMUM
log.console.level = $LOG_CONSOLE_LEVEL
bitcask.merge.policy = $BITCASK_MERGE_POLICY
bitcask.merge_check_interval = $BITCASK_MERGE_CHECK_INTERVAL
bitcask.merge.triggers.fragmentation = $BITCASK_MERGE_TRIGGERS_FRAGMENTATION
bitcask.merge.triggers.dead_bytes = $BITCASK_MERGE_TRIGGERS_DEAD_BYTES
bitcask.merge.thresholds.fragmentation = $BITCASK_MERGE_THRESHOLDS_FRAGMENTATION
bitcask.merge.thresholds.dead_bytes = $BITCASK_MERGE_THRESHOLDS_DEAD_BYTES
bitcask.merge.thresholds.small_file = $BITCASK_MERGE_THRESHOLDS_SMALL_FILE
bitcask.max_file_size = $BITCASK_MAX_FILE_SIZE
END

# Maybe add user config items
if [ -s $USER_CONF ]; then
  cat $USER_CONF >>$RIAK_CONF
fi
