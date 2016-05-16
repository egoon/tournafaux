<div class="row">
    <div class="col-md-7">
        <table id="round-scoring" class="table table-striped">
            <tbody>
            <tr class="table-row">
                <th>Table</th>
                <th><span class="player-name">Player 1</span><span class="player-vp">VP</span></th>
                <th><span class="player-name">Player 2</span><span class="player-vp">VP</span></th>
            </tr>
            </tbody>
            <tbody id="round-table-body">
            <% _.each(tables, function(table) { %>
            <tr class="table-row">
                <td class="gu-unselectable"><%- table.name %></td>

                <td>
                    <span class="player-name"><%- table.player1name %></span>
                    <span class="player-vp">
                        <input id="<%- table.player1id %>" type="number" value="<%- table.player1vp %>" class="form-control"/>
                    </span>
                </td>
                <td class='<%- table.player2.isBye() ? "gu-unselectable" : "" %>' >
                    <span class="player-name"><%- table.player2name %></span>
                    <span class="player-vp">
                        <input id="<%- table.player2id %>" type="number" value="<%- table.player2vp %>" class="form-control"/>
                    </span>
                </td>
            </tr>
            <% }); %>
            <tr class="table-row drop-to-remove"><td class="gu-unselectable"></td><td class="gu-unselectable drop-to-remove" colspan="2">Drop here to remove</td></tr>
            <tbody>
        </table>
        <ul id="validation-errors" class="text-danger" style="display:none"></ul>
        <div class="row">
            <div class="col-md-7">
                <button type="button" id="undo-button" class="btn btn-primary">Undo Switch</button>
            </div>
            <div class="col-md-5">
                <button type="button" id="generate-next-round" class="btn btn-primary">Generate round <%-
                    parseInt(number) + 1 %>
                </button>
                <button type="button" id="end-tournament" class="btn btn-primary">End Tournament</button>
            </div>

        </div>
        <hr/>
        <div class="row">
            <div class="col-md-12">
                <select id="disqualify-select" class="form-control" style="margin-bottom: 10px">
                    <option>Disqualify/Forfeit</option>
                    <% _.each(players, function(player) { %>
                    <option value="<%- player.id %>"><%- player.getName() %></option>
                    <% }); %>
                </select>
            </div>
        </div>
        <div class="row">
            <div class="col-md-12">
                <button id="disqualify-button" class="btn btn-danger">Remove</button>
                <button id="disqualify-now-button" class="btn btn-danger">Remove Now</button>
                <a id="helpDisqualify">(?)</a>
            </div>
        </div>
    </div>
    <div class="col-md-5">
        <div id="standings"></div>
    </div>
</div>