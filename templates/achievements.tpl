<form class="form-horizontal tournament-settings-form" role="form">

  <table class="table table-striped">
    <tbody>
      <tr>
        <th>Achievement</th>
        <% _.each(players, function(player) { %>
          <th><%-player.getName() %></th>
        <% }); %>
      </tr>
    </tbody>
    <tbody id="achievement-table">
      <% _.each(achievements, function(achievement) { %>
        <tr>
          <% _.each(players, function(player) { %>
            <td><input type="checkbox" id="<%- player.getId() + '-' + achievement.getId() %>"
                       title="<%- player.getName() + ': ' + achievement.getName() %>"/></td>
          <% }); %>
        </tr>
      <% }); %>

    </tbody>
  </table>
  <ul id="validation-errors" class="text-danger" style="display:none"></ul>
  <button type="button" id="generate-first-round" class="btn btn-primary">Generate round 1</button>
  <hr/>

</form>