import usersModel from '../models/usersModel.js';

const CONTINENT_LABELS = {
  AF: 'Africa',
  AN: 'Antarctica',
  AS: 'Asia',
  EU: 'Europe',
  NA: 'North America',
  OC: 'Oceania',
  SA: 'South America'
};

const normalizeMember = (member) => {
  const safeName = member.full_name?.trim() || 'Hope Turtle Ally';
  const safeTitle = member.team_title?.trim() || 'Crew Member';
  const watershed = member.location_watershed?.trim() || '—';
  const code = member.continent_code?.trim().toUpperCase() || '';

  return {
    id: member.buwana_id,
    fullName: safeName,
    title: safeTitle,
    countryId: member.country_id ?? '—',
    watershed,
    emoji: member.earthling_emoji || '🌍',
    continent: CONTINENT_LABELS[code] || code || '—'
  };
};

const teamController = {
  async renderTeamPage(req, res, next) {
    try {
      const rawMembers = await usersModel.getTeamMembers();
      const teamMembers = rawMembers.map(normalizeMember);

      res.render('team', {
        pageTitle: 'Meet the HopeTurtles Team | HopeTurtles.org',
        teamMembers
      });
    } catch (error) {
      next(error);
    }
  }
};

export default teamController;
