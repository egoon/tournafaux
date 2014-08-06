<form class="form-horizontal tournament-settings-form" role="form">
  <div class="row">
    <div class="col-md-4">
      <div class="form-group">
        <label for="rounds" class="col-sm-4 control-label">Rounds</label>
        <div class="col-sm-4">
          <input class="form-control" id="rounds" name="rounds" type="number" value="<%- settings.get('rounds') %>" title="Number of rounds."/>
        </div>
      </div>
      <div class="form-group">
        <label for="tables" class="col-sm-4 control-label">Tables</label>
        <div class="col-sm-4">
          <input class="form-control" id="tables" name="tables" type="number" title="Number of tables. Leave empty for players/2" value="<%- settings.get('tables') %>" placeholder=""/>
        </div>
      </div>
      <div class="checkbox">
        <label>
          <input type="checkbox" name="gg14" value="gg14">
          Gaining Grounds 2014
        </label> <a id="helpGG14">(?)</a>
      </div>
      <div class="checkbox">
        <label>
          <input type="checkbox" name="chooseFirstOpponent" value="chooseFirstOpponent">
          Choose First Opponent 
        </label> <a id="helpChooseFirstOpponent">(?)</a>
      </div>
    </div>

    <div class="col-md-4">
      <label>Bye <a id="helpBye">(?)</a> / Ringer <a id="helpRinger">(?)</a></label>
      <div class="radio">
        <label>
          <input type="radio" name="byes" value="average-bye" checked>
          Average Bye
        </label>
      </div>
      <div class="radio">
        <label>
          <input type="radio" name="byes" value="gg14-bye">
          GG'14 Bye
        </label>
      </div>
      <div class="radio">
          <label>
              <input type="radio" name="byes" value="competing-ringer">
              Competing Ringer
          </label>
      </div>
      <div class="radio">
          <label>
              <input type="radio" name="byes" value="non-competing-ringer">
              Non-competing Ringer
          </label>
      </div>
    </div>

    <div class="col-md-4">
      <label>Tournament Type <a id="helpTournamentType">(?)</a></label>
      <div class="radio">
          <label>
              <input type="radio" name="tournamentType" value="swiss" checked>
              Swiss
          </label>
      </div>
      <div class="radio">
          <label>
              <input type="radio" name="tournamentType" value="gg14-swiss">
              GG'14 Swiss-like
          </label>
      </div>
    </div>

  </div>
  <hr/>
  <table class="table table-striped">
    <tbody>
      <tr>
        <th>Player name</th>
        <th>City/Club <a id="helpCityFaction">(?)</a></th>
        <th>Faction <a id="helpCityFaction">(?)</a></th>
        <th class="chooseFirstOpponent">Opponent</th>
        <th>Remove</th>
      </tr>
    </tbody>
    <tbody id="player-table">

      <tr id="new-player-row">
        <td><input id="new-player" class="form-control" name="player" type="text" placeholder="New Player"/>
        </td><td></td><td></td><td></td>
      </tr>
    </tbody>
  </table>
  <ul id="validation-errors" class="text-danger" style="display:none"></ul>
  <button type="button" id="generate-first-round" class="btn btn-primary">Generate round 1</button>
  <hr/>

</form>