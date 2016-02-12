<table class="table table-striped">
  <tbody>
    <tr><th>#</th><th>Player</th><th>TP</th><th>Diff</th><th>VP</th>
    <% if (showFactions) { %>
      <th>Faction</th>
    <% } %>
    </tr>
  </tbody>
  <tbody>
    <% var i = 1;
    _.each(players, function(player) { %>
      <tr>
        <td><%- i %></td>
        <td><%- player.getName() %></td>
        <td><%- player.getTotalTp() %></td>
        <td><%- player.getVpDiff() %></td>
        <td><%- player.getTotalVp() %></td>
        <% if (showFactions) { %>
          <td><%- player.getFaction() %></td>
        <% } %>
      </tr>
    <% ++i; }); %>
  <tbody>
</table>