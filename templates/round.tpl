 <div class="row">
  <div class="col-md-7">
    <table class="table table-striped">
      <theader>
        <tr><th>Table</th><th>Player 1</th><th>VP</th><th>VP</th><th>Player 2</th></tr>
      </theader>
      <tbody>
        <% _.each(tables, function(table) { %>
          <tr>
            <td><%- table.name %></td>
            <td><%- table.player1name %></td>
            <td><input id="<%- table.player1id %>" type="number" value="<%- table.player1vp %>" class="form-control"
              style="width:50px" <%-table.player2.isBye() || table.player1.isBye() ? "disabled": "" %> /></td>
            <td><input id="<%- table.player2id %>" type="number" value="<%- table.player2vp %>" class="form-control"
              style="width:50px" <%-table.player2.isBye() || table.player1.isBye() ? "disabled": "" %> /></td>
            <td><%- table.player2name %></td>
            
          </tr>
        <% }); %>
      <tbody>
    </table>
    <ul id="validation-errors" class="text-danger" style="display:none"></ul>
    <div class="row">
      <div class="col-md-4" <%- parseInt(settings.get('rounds')) <= parseInt(number) ? 'style="display:none"' : "" %> >
        <button type="button" id="generate-next-round" class="btn btn-primary" <%= parseInt(settings.get('rounds')) <= parseInt(number) ? 'style="display:none"' : "" %> >Generate round <%- parseInt(number) + 1 %></button>
      </div>
      <div class="col-md-5">
        <select id="disqualify-select" class="form-control">
          <option>Disqualify/Forfeit</option>
          <% _.each(players, function(player) { %>
            <option value="<%- player.id %>"><%- player.getName() %></option>
          <% }); %>
        </select>
      </div>
      <div class="col-md-3">
        <button id="disqualify-button" class="btn btn-danger">Remove</button>
      </div>
    </div>
  </div>
  <div class="col-md-5">
    <div class="standings"></div>
  </div>
</div>