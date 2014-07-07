<table class="table table-striped">
  <theader>
    <tr><th>#</th><th>Player</th><th>TP</th><th>VP Diff</th><th>VP</th></tr>
  </theader>
  <tbody>
    <% var i = 1;
    _.each(players, function(player) { %>
      <tr>
        <td><%- i %></td>
        <td><%- player.getName() %></td>
        <td><%- player.getTotalTp() %></td>
        <td><%- player.getVpDiff() %></td>
        <td><%- player.getTotalVp() %></td>
      </tr>
    <% ++i; }); %>
  <tbody>
</table>