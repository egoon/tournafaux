<div class="col-md-6">
  <div class="panel panel-default">
    <div class="panel-body">
      <h4><%- player.getName() %></h4>

      <table class="table table-striped">
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
    </div>
  </div>
</div>