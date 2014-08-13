<h5><%- player.getName() %></h5>

<table>
  <tbody>
    <tr>
      <th>Round</th><th>Opponent</th><th>TP</th><th>Score</th><th>Diff</th>
    </tr>
  </tbody>
  <tbody>
    <% _.each(rounds, function(round) { %>
      <tr>
        <td><%-round.number%></td>
        <td><%-round.opponent%></td>
        <td><%-round.tp%></td>
        <td><%-round.score%></td>
        <td><%-round.diff%></td>
      </tr>
    <% }); %>
  </tbody>
</table>