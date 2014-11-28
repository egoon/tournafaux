<h1>Round <%- round.getNumber() %></h1>
<div class="row">
  <div class="col-md-6">
    <table class="table table-striped">
      <tbody>

        <tr><th>Player</th><th>Table</th><th>Player</th></tr>
      </tbody>
      <tbody>
        <% _.each(tables, function(table) { %>
        <tr>
          <td><%- table.player1.getName() %></td>
          <td><%- table.name %></td>
          <td><%- table.player2.getName() %></td>
        </tr>
        <% }); %>
      </tbody>
    </table>
  </div>

  <div class="col-md-6">
    <div class="row">
      <div class="col-md-12"><h3>Deployment</h3></div>
    </div>
    <div class="row">
      <div class="col-md-11 col-md-offset-1"><%- round.getDeployment() %></div>
    </div>
    <div class="row">
      <div class="col-md-12"><h3>Strategy</h3></div>
    </div>
    <div class="row">
      <div class="col-md-11 col-md-offset-1"><%- round.getStrategy() %></div>
    </div>
    <div class="row">
      <div class="col-md-12"><h3>Schemes</h3></div>
    </div>
    <div class="row">
      <div class="col-md-11 col-md-offset-1">
        <% _.each(round.getSchemes(), function(scheme) { %>
          <%- scheme %><br/>
        <% }); %>
      </div>
    </div>
  </div>

</div>